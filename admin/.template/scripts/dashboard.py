require_admin('''${IdpAuth}''')
data = body()
op = op_of(data, "stats")
if op == "recent":
    return "SELECT o.*, COUNT(*) OVER () AS TotalCount FROM orders o ORDER BY CreatedAt DESC LIMIT 10;"
return "SELECT (SELECT COUNT(*) FROM users) AS Users, (SELECT COUNT(*) FROM orders) AS Orders, (SELECT IFNULL(SUM(Total),0) FROM orders WHERE Status IN ('paid','shipped','completed') AND CreatedAt >= datetime('now','-30 days')) AS Revenue30d, (SELECT COUNT(*) FROM orders WHERE Status = 'pending') AS PendingOrders;"
