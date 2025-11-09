# 🧹 Clear Backoffice Cache

## Quick Commands

### Method 1: Browser Console (Recommended)

1. Open backoffice: http://127.0.0.1:5507/backoffice/
2. Press F12 (Developer Tools)
3. Go to "Console" tab
4. Paste and run:

```javascript
// Clear all backoffice localStorage
localStorage.removeItem("vvv_db_v1");
localStorage.removeItem("vvv_session");
localStorage.removeItem("vvv_audit_v1");
console.log("✅ Cache cleared!");
location.reload();
```

### Method 2: Clear All Site Data

1. F12 → Application tab
2. Left sidebar → Storage → Local Storage
3. Right-click on `http://127.0.0.1:5507`
4. Click "Clear"
5. Reload page

### Method 3: Hard Refresh

- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

## When to Clear Cache?

- Trang load chậm bất thường
- Thấy dữ liệu cũ/sai
- Sau khi update code structure
- Test với data mới

## After Clearing

Backoffice sẽ tự động:

1. Tạo mock data mới (100 orders, 50 products)
2. Re-seed database
3. Reload trang

**Time**: ~0.3 giây (fast!)
