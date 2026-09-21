"""Exercise the packaged scripts with Shop's Cloudgate interpolation harness, in memory only."""
import json
import sqlite3
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = json.loads((ROOT / '.template/workflow-template.json').read_text(encoding='utf-8'))['Projects'][0]['Template']
ADMIN = {'Id': 1, 'Email': 'admin@example.invalid', 'Role': 'Admin', 'IsActive': True}

def run(route, name, body=None, user=ADMIN, **keys):
    endpoint = next(e for e in TEMPLATE['Endpoints'] if e['Route'] == route)
    node = next(n for n in TEMPLATE['Nodes'] if n['EndpointId'] == endpoint['Id'] and n['Name'] == name)
    text = node['MainScript']
    values = {'body': json.dumps(body or {}), 'IdpAuth': json.dumps(user), **keys}
    for key, value in values.items():
        text = text.replace('${' + key + '}', value)
    text = text.replace('\\"', '\\\\"')
    scope = {}
    exec('def main():\n' + '\n'.join('    ' + line for line in text.splitlines()), scope)
    return scope['main']()

class Workflows(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        self.db.row_factory = sqlite3.Row
        self.schema = (ROOT / '.template/schema.sql').read_text(encoding='utf-8')
        self.db.executescript(self.schema)

    def tearDown(self):
        self.db.close()

    def test_every_action_has_an_admin_guard_and_valid_graph(self):
        nodes = {n['Id']: n for n in TEMPLATE['Nodes']}
        for endpoint in TEMPLATE['Endpoints']:
            self.assertFalse(endpoint['AllowAnonymous'])
            self.assertTrue(endpoint['EnableLogging'])
            self.assertEqual(endpoint['RequestType'], 2)
            first = nodes[endpoint['NodeId']]
            self.assertEqual(first['NodeType'], 9)
            self.assertEqual(first['IdpAuthorizeRole'], 'Admin')
            self.assertFalse(first['IdpAuthorizeAllowAnonymous'])
            for node in [n for n in nodes.values() if n['EndpointId'] == endpoint['Id']]:
                for key in ['NodeId', 'PositiveNodeId', 'NegativeNodeId']:
                    if node.get(key):
                        self.assertEqual(nodes[node[key]]['EndpointId'], endpoint['Id'])

    def test_schema_rerun_preserves_data_without_provisioning_appearance(self):
        self.db.executescript(self.schema)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM users').fetchone()[0], 12)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM orders').fetchone()[0], 20)
        self.assertIsNone(self.db.execute("SELECT name FROM sqlite_master WHERE name = 'settings'").fetchone())
        self.assertEqual({e['Route'] for e in TEMPLATE['Endpoints']}, {'dashboard', 'users', 'orders'})

    def test_upgrade_does_not_delete_existing_appearance_data(self):
        self.db.execute('CREATE TABLE settings (Id INTEGER PRIMARY KEY, Key TEXT, Value TEXT)')
        self.db.execute("INSERT INTO settings (Key,Value) VALUES ('app_name','Existing brand')")
        self.db.executescript(self.schema)
        self.assertEqual(self.db.execute('SELECT Value FROM settings').fetchone()[0], 'Existing brand')

    def test_script_guards_reject_anonymous_members_and_disabled_admins(self):
        for route, name in [('dashboard', 'DashboardSQL'), ('users', 'UsersSQL'), ('orders', 'OrdersSQL')]:
            for user in [None, {'Id': 2, 'Role': 'member'}, {**ADMIN, 'IsActive': False}]:
                with self.subTest(route=route, user=user), self.assertRaises(Exception):
                    run(route, name, user=user)

    def test_sample_endpoints_still_return_seeded_data_and_bound_paging(self):
        result = self.db.execute(run('dashboard', 'DashboardSQL')).fetchone()
        self.assertEqual(result['Users'], 12); self.assertEqual(result['Orders'], 20)
        rows = self.db.execute(run('orders', 'OrdersSQL', {'op': 'list', 'status': 'pending'})).fetchall()
        self.assertEqual(len(rows), 5)
        sql = run('users', 'UsersSQL', {'take': -1, 'skip': -4})
        self.assertIn('LIMIT 1 OFFSET 0', sql)
        self.assertEqual(len(self.db.execute(sql).fetchall()), 1)

if __name__ == '__main__':
    unittest.main(verbosity=2)
