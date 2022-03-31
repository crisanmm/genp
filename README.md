# genp
CLI tool to generate multiple sizes and formats of an image

# How to run

1. Install dependencies:
```
npm install
```

2. Grant executable rights to `genp.ts`:

```
chmod +x ./genp.ts
```

3. Generate an image, each image in specified format and size:

```
genp.ts foo.jpg --formats=avif,webp,png --sizes=720,1024,1080x1920,original
```
