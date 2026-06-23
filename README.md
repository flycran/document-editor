# document-editor

文书编辑器

## 快速开始

```bash
# 如果使用`mise`则执行这一步
mise install
# 如果不使用`mise`则执行这两步
nvm use 24
npm install bun@1 -g

bun install
bun dev
```

#### 访问地址
http://localhost:4004/editor?account=900101&tenant_id=900101&password=240408

## API文件自动生成

1. 向后端索要openapi地址、文件或者apifox项目地址，如果是apifox项目，需要导出成openapi
2. 将openapi地址添加进环境变量

## 其他

! 禁止修改generated目录下的文件，这些文件由插件生成，任何修改都会被覆盖。
