# Collaboration Guide for Designers

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/kuklas/acm-user-interface.git
cd acm-user-interface
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Your Branch
```bash
git checkout ux-prototypes
git pull origin ux-prototypes
git checkout -b your-name-prototype
```

### 4. Start Development Server
```bash
npm run start:dev
```

## Creating a New Prototype

### Use the Template Script
```bash
npm run create-prototype
# or
npm run create-draft
```

Follow the prompts to create your prototype.

### Manual Creation
1. Copy the template:
```bash
cp -r src/app/prototypes/_template src/app/prototypes/your-prototype-name
```

2. Edit `src/app/prototypes/your-prototype-name/prototype.config.ts`
3. Edit `src/app/prototypes/your-prototype-name/routes.tsx`
4. Add your pages in `src/app/prototypes/your-prototype-name/pages/`

## Daily Workflow

### Start of Day
```bash
git checkout ux-prototypes
git pull origin ux-prototypes
git checkout your-name-prototype
git merge ux-prototypes  # Get latest changes
```

### During Work
- **ONLY edit files in your prototype directory**: `src/app/prototypes/your-prototype-name/`
- Avoid modifying shared files unless absolutely necessary
- Test your prototype: `npm run start:dev`

### End of Day
```bash
git add src/app/prototypes/your-prototype-name/
git commit -m "Add your-prototype-name"
git push origin your-name-prototype
```

## Creating Versions

To create version 1.1 of an existing prototype:

1. Copy the prototype:
```bash
cp -r src/app/prototypes/original-name src/app/prototypes/original-name-v1.1
```

2. Update the config:
```typescript
// In prototype.config.ts
{
  id: 'original-name-v1.1',
  versionGroup: 'original-name',  // ⚠️ Must match original
  version: 'v1.1',
  // ... rest of config
}
```

3. Push - it will automatically appear as a version selector in the same card!

## Pull Request Workflow

1. Push your branch:
```bash
git push origin your-name-prototype
```

2. Go to GitHub → Create Pull Request
3. Select: `your-name-prototype` → `ux-prototypes`
4. Add description
5. Request review (optional)
6. Merge when approved

## Important Rules

✅ **DO:**
- Work in your own prototype directory
- Pull before starting work
- Commit frequently
- Use descriptive commit messages

❌ **DON'T:**
- Modify other designers' prototypes
- Modify shared files without discussion
- Force push (`git push --force`)
- Commit directly to `ux-prototypes` (use your branch)

## Getting Help

- Check existing prototypes for examples
- Review `src/app/prototypes/_template/` for structure
- Ask in GitHub Issues or team chat

## Troubleshooting

**"Prototype not showing in launcher"**
- Make sure `prototype.config.ts` exists
- Check that `status` is not `'archived'`
- Restart dev server: `npm run start:dev`

**"Merge conflict"**
- Pull latest: `git pull origin ux-prototypes`
- Resolve conflicts in the file
- Commit: `git add . && git commit`

**"Can't push"**
- Make sure you're on your branch: `git branch`
- Pull first: `git pull origin ux-prototypes`
- Try again: `git push origin your-branch`

