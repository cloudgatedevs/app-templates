require_admin('''${IdpAuth}''')
data = body()
op = op_of(data, "list")
def s(v):
    if v is None or v == "": return "NULL"
    return "'" + str(v).replace("'","''") + "'"
def iv(v):
    try:
        if v is None or v=="": return "NULL"
        return str(int(v))
    except Exception: return "NULL"
def num(v):
    try:
        if v is None or v=="": return "0"
        return str(float(v))
    except Exception: return "0"
TEXT={"reference":"Reference","customerName":"CustomerName","customerEmail":"CustomerEmail","status":"Status","notes":"Notes","currency":"Currency"}
INTG={"userId":"UserId","items":"Items"}
NUMF={"total":"Total"}
if op == "list":
    where=["1=1"]
    q=data.get("search") or data.get("q")
    if q:
        like="'%"+str(q).replace("'","''")+"%'"
        where.append("(Reference LIKE "+like+" OR CustomerName LIKE "+like+" OR CustomerEmail LIKE "+like+")")
    if data.get("status"):
        where.append("Status = "+s(data.get("status")))
    take=str(clamp(data.get("take"), 1, 200, 50))
    skip=str(max(0, to_int(data.get("skip"), 0)))
    return "SELECT o.*, COUNT(*) OVER () AS TotalCount FROM orders o WHERE "+" AND ".join(where)+" ORDER BY CreatedAt DESC LIMIT "+take+" OFFSET "+skip+";"
if op in ("get","detail"):
    return "SELECT * FROM orders WHERE Id = "+iv(data.get("id"))+";"
if op == "create":
    cols=[]; vals=[]
    for k,c in TEXT.items():
        if k in data: cols.append(c); vals.append(s(data.get(k)))
    for k,c in INTG.items():
        if k in data: cols.append(c); vals.append(iv(data.get(k)))
    for k,c in NUMF.items():
        if k in data: cols.append(c); vals.append(num(data.get(k)))
    if "Status" not in cols: cols.append("Status"); vals.append("'pending'")
    if "Reference" not in cols:
        cols.append("Reference"); vals.append("'ORD-' || strftime('%s','now')")
        return "INSERT INTO orders ("+", ".join(cols)+") SELECT "+", ".join(vals)+"; SELECT * FROM orders WHERE Id = last_insert_rowid();"
    return "INSERT INTO orders ("+", ".join(cols)+") VALUES ("+", ".join(vals)+"); SELECT * FROM orders WHERE Id = last_insert_rowid();"
if op in ("update","status"):
    oid=iv(data.get("id"))
    sets=[]
    for k,c in TEXT.items():
        if k in data: sets.append(c+" = "+s(data.get(k)))
    for k,c in INTG.items():
        if k in data: sets.append(c+" = "+iv(data.get(k)))
    for k,c in NUMF.items():
        if k in data: sets.append(c+" = "+num(data.get(k)))
    sets.append("UpdatedAt = CURRENT_TIMESTAMP")
    return "UPDATE orders SET "+", ".join(sets)+" WHERE Id = "+oid+"; SELECT * FROM orders WHERE Id = "+oid+";"
if op == "delete":
    return "DELETE FROM orders WHERE Id = "+iv(data.get("id"))+"; SELECT "+iv(data.get("id"))+" AS DeletedId;"
return "SELECT o.*, COUNT(*) OVER () AS TotalCount FROM orders o ORDER BY CreatedAt DESC LIMIT 50;"
