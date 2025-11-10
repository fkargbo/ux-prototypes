# Prototype Template

This template provides a starting point for creating new prototypes for user research and testing.

## Quick Start

### 1. Copy this directory

```bash
cp -r src/app/prototypes/_template src/app/prototypes/your-prototype-name
```

### 2. Update the configuration

Edit `prototype.config.ts` and update:

- **id**: Unique identifier (kebab-case, e.g., `my-awesome-feature`)
- **name**: Display name shown in the launcher
- **description**: Brief description (2-3 sentences)
- **owner**: Your name, Slack handle, and email
- **persona**: User persona details
- **perspectives**: Array of enabled perspectives (only these will be enabled in the UI)
  - Options: `'core-platforms'`, `'fleet-management'`, `'fleet-virtualization'`
- **tags**: Keywords for filtering

### 3. Build your pages

Add your prototype pages in the `pages/` directory. The default `HomePage.tsx` is already set up.

### 4. Define your routes

Edit `routes.tsx` to add navigation routes for your prototype.

### 5. Test your prototype

1. Save your changes
2. The prototype will automatically be discovered by webpack
3. Refresh your browser
4. You'll see your new prototype in the launcher under the "Draft" tab

## Template Features

### What's included

- ✅ **Empty landing page** - No placeholder content, ready for your design
- ✅ **Masthead** - Shows "Your Name Here" and "Your Persona Name Here" by default
- ✅ **Perspective selector** - Core platforms enabled, others disabled
- ✅ **Navigation** - Empty navigation structure ready for your links
- ✅ **Version 1.0.0** - Standard starting version
- ✅ **Draft status** - Visible only in Draft tab until you mark it active

### Customizing perspectives

The `perspectives` array in your config controls which perspectives are enabled:

```typescript
// Only Core platforms enabled
perspectives: ['core-platforms']

// Multiple perspectives enabled
perspectives: ['core-platforms', 'fleet-management']

// All perspectives enabled
perspectives: ['core-platforms', 'fleet-management', 'fleet-virtualization']
```

Perspectives not in this list will show as "(Disabled)" in the dropdown.

## Directory Structure

```
your-prototype-name/
├── prototype.config.ts   # Configuration and metadata
├── routes.tsx           # Route definitions
├── pages/              # Your prototype pages
│   └── HomePage.tsx    # Default landing page
└── README.md          # This file
```

## Tips

1. **Start simple** - Begin with a single page and expand as needed
2. **Use shared components** - Import from `@app/shared` when possible
3. **Follow PatternFly guidelines** - Use PatternFly components for consistency
4. **Test frequently** - The hot reload will show your changes immediately
5. **Keep it focused** - Each prototype should test a specific feature or workflow

## Need Help?

Refer to the documentation in `/ai-documentation/` for:
- PatternFly component usage
- Styling standards
- Component architecture patterns
- Common issues and troubleshooting

---

**Ready to build?** Copy this template, update the config, and start creating!
