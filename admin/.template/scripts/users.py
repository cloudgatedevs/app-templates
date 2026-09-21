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
TEXT={"name":"Name","surname":"Surname","email":"Email","phone":"Phone","role":"Role","status":"Status","avatarUrl":"AvatarUrl"}
if op == "list":
    where=["1=1"]
    q=data.get("search") or data.get("q")
    if q:
        like="'%"+str(q).replace("'","''")+"%'"
        where.append("(Name LIKE "+like+" OR Surname LIKE "+like+" OR Email LIKE "+like+")")
    if data.get("role"):
        where.append("Role = "+s(data.get("role")))
    if data.get("status"):
        where.append("Status = "+s(data.get("status")))
    take=str(clamp(data.get("take"), 1, 200, 50))
    skip=str(max(0, to_int(data.get("skip"), 0)))
    return "SELECT u.*, COUNT(*) OVER () AS TotalCount FROM users u WHERE "+" AND ".join(where)+" ORDER BY CreatedAt DESC LIMIT "+take+" OFFSET "+skip+";"
if op in ("get","detail"):
    return "SELECT * FROM users WHERE Id = "+iv(data.get("id"))+";"
if op == "create":
    cols=[]; vals=[]
    for k,c in TEXT.items():
        if k in data: cols.append(c); vals.append(s(data.get(k)))
    if "Role" not in cols: cols.append("Role"); vals.append("'member'")
    if "Status" not in cols: cols.append("Status"); vals.append("'invited'")
    return "INSERT INTO users ("+", ".join(cols)+") VALUES ("+", ".join(vals)+"); SELECT * FROM users WHERE Id = last_insert_rowid();"
if op in ("update","disable","enable"):
    uid=iv(data.get("id"))
    sets=[]
    for k,c in TEXT.items():
        if k in data: sets.append(c+" = "+s(data.get(k)))
    if op=="disable": sets.append("Status = 'disabled'")
    if op=="enable": sets.append("Status = 'active'")
    sets.append("UpdatedAt = CURRENT_TIMESTAMP")
    return "UPDATE users SET "+", ".join(sets)+" WHERE Id = "+uid+"; SELECT * FROM users WHERE Id = "+uid+";"
if op == "delete":
    return "DELETE FROM users WHERE Id = "+iv(data.get("id"))+"; SELECT "+iv(data.get("id"))+" AS DeletedId;"
return "SELECT u.*, COUNT(*) OVER () AS TotalCount FROM users u ORDER BY CreatedAt DESC LIMIT 50;"
