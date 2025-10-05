# Shared Header Component Guide

## ✅ What Was Created

A unified header component with smooth tab transition animations that can be used across all pages.

---

## 📁 Files Created/Modified

### 1. **`main/shared/header.js`** (NEW)
- Shared header component
- Smooth tab indicator animation
- Automatic logout handling
- Dynamic page titles

### 2. **`main/shared/common.css`** (UPDATED)
- Added `.tab-indicator` styles
- Smooth cubic-bezier transitions
- Purple gradient animated bar
- Hover effects on tabs

### 3. **`main/Dashboard/dashboard.html`** (UPDATED - Example)
- Replaced hardcoded header with component
- Added header initialization

---

## 🎨 Features

### ✨ Smooth Tab Indicator
- **Purple gradient bar** that smoothly slides between tabs
- **Cubic-bezier easing** for natural movement
- **Hover preview** - bar moves to tab on hover
- **Returns to active** tab when mouse leaves
- **Responsive** - adjusts on window resize

### 🎯 Unified Header
- **Single source of truth** for header HTML
- **Consistent across all pages**
- **Easy to update** - change once, applies everywhere
- **Automatic logout** handling built-in

---

## 🚀 How to Use

### Step 1: Update HTML
Replace the hardcoded `<header>` with:

```html
<!-- Header will be injected here -->
<div id="header-container"></div>
```

### Step 2: Add Scripts
Add the header script before your page scripts:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../shared/supabase-config.js"></script>
<script src="../shared/header.js"></script>  <!-- ADD THIS -->
```

### Step 3: Initialize Header
In your page script, initialize the header:

```javascript
// Initialize header with the active page name
headerComponent.initialize('dashboard');  // or 'reports', 'patients', etc.
```

### Page Names:
- `'dashboard'` - Dashboard page
- `'upload'` - Upload DICOM page
- `'reports'` - Reports page
- `'telehealth'` - Telehealth page
- `'patients'` - Patients page
- `'patient-detail'` - Patient Detail page

---

## 📝 Example: Update Reports Page

### Before:
```html
<header class="topnav">
    <div class="row">
        <!-- ... lots of HTML ... -->
    </div>
    <nav class="tabs">
        <!-- ... tabs ... -->
    </nav>
</header>
```

### After:
```html
<!-- Header will be injected here -->
<div id="header-container"></div>
```

### In Scripts:
```html
<script src="../shared/supabase-config.js"></script>
<script src="../shared/header.js"></script>

<script>
    // ... auth check ...
    
    // Initialize header
    headerComponent.initialize('reports');
    
    // ... rest of your code ...
</script>
```

---

## 🎨 Animation Details

### Tab Indicator CSS:
```css
.tab-indicator{
  position: absolute;
  bottom: -1px;
  height: 3px;
  background: linear-gradient(90deg, var(--brand), #7a5af8);
  border-radius: 3px 3px 0 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -2px 8px rgba(109, 93, 252, 0.3);
}
```

### Transition Timing:
- **Duration:** 0.3s
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1) - smooth ease-in-out
- **Properties:** left, width (position and size)

### Hover Behavior:
1. Mouse enters tab → indicator slides to that tab
2. Mouse leaves tabs area → indicator returns to active tab
3. Smooth animation throughout

---

## 🔧 Customization

### Change Animation Speed:
Edit `header.js` line with transition:
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```
Change `0.3s` to your preferred duration.

### Change Indicator Color:
Edit `common.css`:
```css
background: linear-gradient(90deg, var(--brand), #7a5af8);
```

### Change Indicator Height:
Edit `common.css`:
```css
height: 3px;  /* Change this value */
```

---

## 📋 Pages to Update

### ✅ Updated:
- [x] Dashboard

### 🔲 To Update:
- [ ] Reports
- [ ] Patients
- [ ] Patient Detail
- [ ] Upload DICOM (when created)
- [ ] Telehealth (when created)

---

## 🔄 Update All Pages Script

For each page, follow these steps:

### 1. **Reports Page:**
```html
<!-- Replace header in reports.html -->
<div id="header-container"></div>

<!-- Add script -->
<script src="../shared/header.js"></script>

<!-- Initialize -->
<script>
    headerComponent.initialize('reports');
</script>
```

### 2. **Patients Page:**
```html
<!-- Replace header in patients.html -->
<div id="header-container"></div>

<!-- Add script -->
<script src="../shared/header.js"></script>

<!-- Initialize -->
<script>
    headerComponent.initialize('patients');
</script>
```

### 3. **Patient Detail Page:**
```html
<!-- Replace header in patient-detail.html -->
<div id="header-container"></div>

<!-- Add script -->
<script src="../shared/header.js"></script>

<!-- Initialize -->
<script>
    headerComponent.initialize('patient-detail');
</script>
```

---

## ✨ Benefits

### 1. **Consistency**
- Same header across all pages
- No more copy-paste errors
- Single source of truth

### 2. **Maintainability**
- Update header once, applies everywhere
- Easy to add new tabs
- Easy to modify styling

### 3. **User Experience**
- Smooth animations
- Visual feedback on hover
- Professional feel

### 4. **Developer Experience**
- Less code duplication
- Cleaner HTML files
- Easier to debug

---

## 🎯 Next Steps

1. **Update remaining pages** with the header component
2. **Test animations** on all pages
3. **Verify logout** functionality works
4. **Check responsive** behavior on mobile

---

## 🐛 Troubleshooting

### Indicator not showing:
- Check that `<div id="header-container"></div>` exists
- Verify `header.js` is loaded
- Check browser console for errors

### Indicator not animating:
- Ensure `common.css` has the updated styles
- Clear browser cache
- Check that active tab is set correctly

### Logout not working:
- Verify `authService` is loaded
- Check that `supabase-config.js` is included before `header.js`

---

## 🎉 Result

**You now have a unified, animated header component that:**
- ✅ Works across all pages
- ✅ Has smooth purple bar transitions
- ✅ Provides visual feedback on hover
- ✅ Is easy to maintain and update
- ✅ Looks professional and polished

**Enjoy your new animated header!** 🚀
