import type { ParsedInterface, Property } from "./astParser";

export function generateVueComponent(interfaces: ParsedInterface[]): string {
  const mainInterface = interfaces[0];
  if (!mainInterface) return "";

  const formFields = mainInterface.properties
    .filter((p) => p.name !== "id" && !p.name.includes("At"))
    .map(generateFormField)
    .join("\n      ");

  const formData = mainInterface.properties
    .filter((p) => p.name !== "id" && !p.name.includes("At"))
    .map((p) => `  ${p.name}: ${getDefaultValue(p.type)},`)
    .join("\n");

  return `<template>
  <div class="${mainInterface.name.toLowerCase()}-form">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      ${formFields}
      
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" style="width: 100%" class="mt-4">
      ${mainInterface.properties
        .map((p) => `<el-table-column prop="${p.name}" label="${p.name}" />`)
        .join("\n      ")}
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

interface ${mainInterface.name} {
${mainInterface.properties
  .map((p) => `  ${p.name}${p.optional ? "?" : ""}: ${p.type}`)
  .join("\n")}
}

const formRef = ref()
const form = reactive<Partial<${mainInterface.name}>>({
${formData}
})

const tableData = ref<${mainInterface.name}[]>([])

const rules = {
${mainInterface.properties
  .filter((p) => !p.optional && p.name !== "id")
  .map(
    (p) =>
      `  ${p.name}: [{ required: true, message: '请输入${p.name}', trigger: 'blur' }],`
  )
  .join("\n")}
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    // TODO: 调用API保存数据
    console.log('提交数据:', form)
    ElMessage.success('保存成功')
    handleReset()
    await fetchData()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleReset = () => {
  formRef.value.resetFields()
}

const handleEdit = (row: ${mainInterface.name}) => {
  Object.assign(form, row)
}

const handleDelete = async (row: ${mainInterface.name}) => {
  // TODO: 调用API删除数据
  console.log('删除数据:', row)
  ElMessage.success('删除成功')
  await fetchData()
}

const fetchData = async () => {
  // TODO: 调用API获取数据
  tableData.value = []
}

onMounted(() => {
  fetchData()
})
</script>`;
}

function generateFormField(property: Property): string {
  const { name, type, optional } = property;

  switch (type) {
    case "string":
      return `<el-form-item label="${name}" prop="${name}">
        <el-input v-model="form.${name}" placeholder="请输入${name}" />
      </el-form-item>`;

    case "number":
      return `<el-form-item label="${name}" prop="${name}">
        <el-input-number v-model="form.${name}" placeholder="请输入${name}" />
      </el-form-item>`;

    case "boolean":
      return `<el-form-item label="${name}" prop="${name}">
        <el-switch v-model="form.${name}" />
      </el-form-item>`;

    case "Date":
      return `<el-form-item label="${name}" prop="${name}">
        <el-date-picker v-model="form.${name}" type="datetime" placeholder="选择${name}" />
      </el-form-item>`;

    default:
      return `<el-form-item label="${name}" prop="${name}">
        <el-input v-model="form.${name}" placeholder="请输入${name}" />
      </el-form-item>`;
  }
}

export function generateKoaRoute(interfaces: ParsedInterface[]): string {
  const mainInterface = interfaces[0];
  if (!mainInterface) return "";

  const modelName = mainInterface.name.toLowerCase();

  return `import Router from '@koa/router'
import { PrismaClient } from '@prisma/client'

const router = new Router()
const prisma = new PrismaClient()

// 获取${mainInterface.name}列表
router.get('/${modelName}s', async (ctx) => {
  try {
    const ${modelName}s = await prisma.${modelName}.findMany()
    ctx.body = { data: ${modelName}s }
  } catch (error) {
    ctx.status = 500
    ctx.body = { error: error.message }
  }
})

// 创建${mainInterface.name}
router.post('/${modelName}s', async (ctx) => {
  try {
    const ${modelName}Data = ctx.request.body
    const ${modelName} = await prisma.${modelName}.create({
      data: ${modelName}Data
    })
    ctx.body = { data: ${modelName} }
  } catch (error) {
    ctx.status = 500
    ctx.body = { error: error.message }
  }
})

// 更新${mainInterface.name}
router.put('/${modelName}s/:id', async (ctx) => {
  try {
    const { id } = ctx.params
    const ${modelName}Data = ctx.request.body
    const ${modelName} = await prisma.${modelName}.update({
      where: { id: parseInt(id) },
      data: ${modelName}Data
    })
    ctx.body = { data: ${modelName} }
  } catch (error) {
    ctx.status = 500
    ctx.body = { error: error.message }
  }
})

// 删除${mainInterface.name}
router.delete('/${modelName}s/:id', async (ctx) => {
  try {
    const { id } = ctx.params
    await prisma.${modelName}.delete({
      where: { id: parseInt(id) }
    })
    ctx.body = { message: '删除成功' }
  } catch (error) {
    ctx.status = 500
    ctx.body = { error: error.message }
  }
})

export default router`;
}

export function generatePrismaModel(interfaces: ParsedInterface[]): string {
  const mainInterface = interfaces[0];
  if (!mainInterface) return "";

  const fields = mainInterface.properties
    .map((property) => {
      const { name, type, optional } = property;
      const prismaType = getPrismaType(type);
      const optionalMark = optional ? "?" : "";

      let fieldDef = `  ${name} ${prismaType}${optionalMark}`;

      // 添加特殊属性
      if (name === "id") {
        fieldDef += " @id @default(autoincrement())";
      } else if (name === "createdAt") {
        fieldDef += " @default(now())";
      } else if (name === "updatedAt") {
        fieldDef += " @updatedAt";
      }

      return fieldDef;
    })
    .join("\n");

  return `model ${mainInterface.name} {
${fields}
}`;
}

function getDefaultValue(type: string): string {
  switch (type) {
    case "string":
      return "''";
    case "number":
      return "0";
    case "boolean":
      return "false";
    case "Date":
      return "new Date()";
    default:
      return "null";
  }
}

function getPrismaType(type: string): string {
  switch (type) {
    case "string":
      return "String";
    case "number":
      return "Int";
    case "boolean":
      return "Boolean";
    case "Date":
      return "DateTime";
    default:
      return "String";
  }
}
