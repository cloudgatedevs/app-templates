"""Rebuild scripts/schema in the checked-in Cloudgate export; does not deploy anything."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUNDLE = ROOT / '.template/workflow-template.json'
SCRIPTS = ROOT / '.template/scripts'
SOURCES = {
    ('dashboard', 'DashboardSQL'): 'dashboard.py',
    ('users', 'UsersSQL'): 'users.py',
    ('orders', 'OrdersSQL'): 'orders.py',
}

def package():
    bundle = json.loads(BUNDLE.read_text(encoding='utf-8'))
    template = bundle['Projects'][0]['Template']
    routes = {endpoint['Id']: endpoint['Route'] for endpoint in template['Endpoints']}
    helpers = (SCRIPTS / 'helpers.py').read_text(encoding='utf-8')
    for node in template['Nodes']:
        source = SOURCES.get((routes[node['EndpointId']], node['Name']))
        if source:
            node['MainScript'] = helpers + '\n\n' + (SCRIPTS / source).read_text(encoding='utf-8')
    schema = (ROOT / '.template/schema.sql').read_text(encoding='utf-8')
    for database in template['Databases']:
        database['SQLScript'] = schema
    BUNDLE.write_text(json.dumps(bundle, indent=2) + '\n', encoding='utf-8')
    print('Packaged', len(template['Endpoints']), 'actions and the admin_db schema. No remote changes.')

if __name__ == '__main__':
    package()
