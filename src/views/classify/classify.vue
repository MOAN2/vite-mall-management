<template>
  <div class="classify-container">
    <div class="header">
      <h2>家政分类管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchValue"
          style="width: 240px"
          placeholder="请输入分类名称"
          :prefix-icon="Search"
          clearable
          @change="handleCurrentChange(1)"
        />
        <el-button
          type="danger"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
          >批量删除</el-button
        >
        <el-button type="primary" @click="handleAdd">新增分类</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="categoryId" label="分类ID" width="100" />
      <el-table-column prop="categoryName" label="分类名称" width="120" />
      <el-table-column prop="sortOrder" label="排序权重" width="100" />
      <el-table-column prop="level" label="分类层级" width="100">
        <template #default="scope">
          {{ levelEnum[scope.row.level].label }}
        </template></el-table-column
      >
      <el-table-column prop="icon" label="分类图标" width="100">
        <template #default="scope">
          <div v-if="scope.row.level === 1">
            <img :src="getIconPath(scope.row.icon)" width="24" height="24" />
          </div>
          <div v-else>-</div>
        </template></el-table-column
      >
      <el-table-column label="启用状态" width="120">
        <template #default="scope">
          {{ scope.row.isEnabled ? "启动" : "停用" }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" size="small" @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pageNo"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增分类' : '编辑分类'"
      width="500px"
      center
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="启用状态" prop="isEnabled">
          <el-switch v-model="form.isEnabled" />
        </el-form-item>
        <el-form-item label="分类层级" prop="level">
          <el-select
            v-model="form.level"
            placeholder="请选择分类层级"
            style="width: 100%"
          >
            <el-option
              v-for="item in levelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          /></el-select>
        </el-form-item>
        <el-form-item label="父级分类" prop="parentId" v-if="form.level === 2">
          <el-select
            v-model="form.parentId"
            placeholder="请选择父类层级"
            style="width: 100%"
          >
            <el-option
              v-for="item in parentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="主分类图标" prop="icon" v-if="form.level === 1">
          <el-select
            v-model="form.icon"
            placeholder="请选择分类图标"
            style="width: 100%"
          >
            <el-option
              v-for="item in iconOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          /></el-select>
        </el-form-item>
        <el-form-item label="排序权重" prop="sortOrder">
          <el-input-number
            v-model="form.sortOrder"
            :min="0"
            :precision="0"
            :step="1"
            style="width: 100%"
            placeholder="请输入排序权重"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量删除确认弹窗 -->
    <el-dialog
      v-model="batchDeleteDialogVisible"
      title="批量删除确认"
      width="400px"
      center
    >
      <div class="batch-delete-confirm">
        <el-icon class="warning-icon"><WarningFilled /></el-icon>
        <p>确定要删除选中的 {{ selectedRows.length }} 个分类吗？</p>
        <p class="warning-text">删除后将无法恢复，请谨慎操作！</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDeleteDialogVisible = false">取消</el-button>
          <el-button
            type="danger"
            @click="confirmBatchDelete"
            :loading="batchDeleteLoading"
          >
            确认删除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { WarningFilled, Search } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import * as api from "@/api/classify.js";
import { levelEnum, iconOptions } from "@/enum/index";

// 获取图标路径
const getIconPath = (iconValue) => {
  try {
    // 获取图标名称（不带路径）

    const iconObj = iconOptions.find((item) => item.value === iconValue);
    if (!iconObj) return "";

    // 从path中提取文件名
    let fileName = "";
    if (iconObj.path) {
      // 处理路径格式，提取文件名
      const pathParts = iconObj.path.split("/");
      fileName = pathParts[pathParts.length - 1];
    }

    // 如果没有文件名，使用默认图标
    if (!fileName) {
      fileName = "jiazhengfuwu.png";
    }

    // 直接从assets目录加载
    return `/src/assets/icon/${fileName}`;
  } catch (error) {
    console.error("获取图标路径出错:", error);
    return "";
  }
};

// 格式化日期函数
const formatDate = (date) => {
  return dayjs(date).format("YYYY/MM/DD HH:mm");
};
const levelOptions = [
  { value: 1, label: "主类" },
  { value: 2, label: "子类" },
];

// todo
const parentOptions = [
  { value: 1, label: "日常保洁" },
  { value: 2, label: "深度清洁" },
  { value: 3, label: "家电清洗" },
  { value: 4, label: "厨卫保洁" },
  { value: 5, label: "家居养护" },
  { value: 6, label: "母婴护理" },
  { value: 7, label: "老人照护" },
];
// 表格数据
const tableData = ref([]);
const loading = ref(false);
const total = ref(0);
const pageNo = ref(1);
const pageSize = ref(10);
const searchValue = ref("");
// 选中行数据
const selectedRows = ref([]);

// 批量删除相关
const batchDeleteDialogVisible = ref(false);
const batchDeleteLoading = ref(false);

// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref("add"); // 'add' 或 'edit'
const formRef = ref(null);
const form = reactive({
  categoryName: "",
  parentId: null,
  level: 1,
  icon: "1",
  sortOrder: 0,
  isEnabled: true,
});

// 表单验证规则
const rules = {
  categoryName: [
    { required: true, message: "请输入分类名称", trigger: "blur" },
    { min: 1, max: 10, message: "长度在 1 到 10 个字符之间", trigger: "blur" },
  ],
  level: [{ required: true, message: "请选择分类层级" }],
  sortOrder: [{ required: true, message: "请输入分类权重" }],
  icon: [{ required: true, message: "请输入分类图标" }],
  parentId: [{ required: true, message: "请输入父级分类" }],
};

// 加载表格数据
const loadTableData = async () => {
  loading.value = true;
  selectedRows.value = []; // 重置选中的行

  try {
    const { data } = await api.getClassListApi({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      categoryName: searchValue.value,
    });
    // todo
    // const data = {
    //   totalCount: 10,
    //   dataList: [
    //     {
    //       categoryId: 1,
    //       categoryName: "清洁服务",
    //       parentId: 1,
    //       level: 1,
    //       icon: "1",
    //       sortOrder: 1,
    //       isEnabled: true,
    //       createdAt: "2024-05-20T10:00:00Z",
    //       updatedAt: "2024-05-20T10:00:00Z",
    //     },
    //     {
    //       categoryId: 2,
    //       categoryName: "家电维修",
    //       parentId: 0,
    //       level: 2,
    //       icon: "2",
    //       sortOrder: 2,
    //       isEnabled: true,
    //       createdAt: "2024-05-21T10:00:00Z",
    //       updatedAt: "2024-05-21T10:00:00Z",
    //     },
    //     {
    //       categoryId: 3,
    //       categoryName: "保姆服务",
    //       parentId: 0,
    //       level: 1,
    //       icon: "3",
    //       sortOrder: 3,
    //       isEnabled: true,
    //       createdAt: "2024-05-22T10:00:00Z",
    //       updatedAt: "2024-05-22T10:00:00Z",
    //     },
    //     {
    //       categoryId: 4,
    //       categoryName: "月嫂服务",
    //       parentId: 0,
    //       level: 1,
    //       icon: "4",
    //       sortOrder: 4,
    //       isEnabled: true,
    //       createdAt: "2024-05-23T10:00:00Z",
    //       updatedAt: "2024-05-23T10:00:00Z",
    //     },
    //     {
    //       categoryId: 5,
    //       categoryName: "钟点工",
    //       parentId: 0,
    //       level: 1,
    //       icon: "5",
    //       sortOrder: 5,
    //       isEnabled: true,
    //       createdAt: "2024-05-24T10:00:00Z",
    //       updatedAt: "2024-05-24T10:00:00Z",
    //     },
    //     {
    //       categoryId: 6,
    //       categoryName: "家庭保洁",
    //       parentId: 1,
    //       level: 2,
    //       icon: "6",
    //       sortOrder: 1,
    //       isEnabled: true,
    //       createdAt: "2024-05-25T10:00:00Z",
    //       updatedAt: "2024-05-25T10:00:00Z",
    //     },
    //     {
    //       categoryId: 7,
    //       categoryName: "玻璃清洁",
    //       parentId: 1,
    //       level: 2,
    //       icon: "7",
    //       sortOrder: 2,
    //       isEnabled: true,
    //       createdAt: "2024-05-26T10:00:00Z",
    //       updatedAt: "2024-05-26T10:00:00Z",
    //     },
    //     {
    //       categoryId: 8,
    //       categoryName: "家电清洗",
    //       parentId: 1,
    //       level: 2,
    //       icon: "8",
    //       sortOrder: 3,
    //       isEnabled: true,
    //       createdAt: "2024-05-27T10:00:00Z",
    //       updatedAt: "2024-05-27T10:00:00Z",
    //     },
    //     {
    //       categoryId: 9,
    //       categoryName: "冰箱维修",
    //       parentId: 2,
    //       level: 2,
    //       icon: "9",
    //       sortOrder: 1,
    //       isEnabled: true,
    //       createdAt: "2024-05-28T10:00:00Z",
    //       updatedAt: "2024-05-28T10:00:00Z",
    //     },
    //     {
    //       categoryId: 10,
    //       categoryName: "洗衣机维修",
    //       parentId: 2,
    //       level: 2,
    //       icon: "10",
    //       sortOrder: 2,
    //       isEnabled: true,
    //       createdAt: "2024-05-29T10:00:00Z",
    //       updatedAt: "2024-05-29T10:00:00Z",
    //     },
    //   ],
    // };
    console.log("data", data);

    tableData.value = data.dataList || [];

    total.value = Number(data.totalCount);
  } catch (error) {
    loading.value = false;
    ElMessage.error(data?.message || "获取数据失败");
  }
  loading.value = false;
};

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

// 页码变化
const handleCurrentChange = (val) => {
  pageNo.value = val;
  loadTableData();
};

// 每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  loadTableData();
};

// 新增分类
const handleAdd = () => {
  dialogType.value = "add";

  Object.assign(form, {
    categoryName: "",
    level: 1,
    icon: "1",
    sortOrder: 0,
    isEnabled: true,
  });
  dialogVisible.value = true;
};

// 编辑分类
const handleEdit = (row) => {
  dialogType.value = "edit";
  Object.assign(form, row);
  dialogVisible.value = true;
};
const initTable = () => {
  pageSize.value = 10;
  pageNo.value = 1;
  loadTableData();
};
// 删除分类
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除分类"${row.categoryName}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        await api.delClassApi({ categoryIdList: [row.categoryId] });

        initTable();
        ElMessage.success("删除成功");
      } catch (error) {
        ElMessage.error(error || "删除失败，请重试");
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    return;
  }
  batchDeleteDialogVisible.value = true;
};

// 确认批量删除
const confirmBatchDelete = async () => {
  batchDeleteLoading.value = true;

  try {
    // 获取所有选中行的ID
    const selectedIds = selectedRows.value.map((item) => item.categoryId);
    await api.delClassApi({ categoryIdList: selectedIds });

    batchDeleteLoading.value = false;
    batchDeleteDialogVisible.value = false;
    selectedRows.value = [];
    initTable();
    ElMessage.success(`成功删除${selectedIds.length}个分类`);
  } catch (error) {
    ElMessage.error(error || "删除失败，请重试");
  }
};
const submitFormFn = async () => {
  let newCategory = {
    categoryName: form.categoryName,
    level: form.level,
    icon: form.icon,
    sortOrder: form.sortOrder,
    isEnabled: form.isEnabled,
  };
  if (form.level === 2) newCategory.parentId = form.parentId;
  if (form?.categoryId) newCategory.categoryId = form.categoryId;
  if (dialogType.value === "add") {
    // 新增分类

    try {
      await api.addClassApi(newCategory);
      ElMessage.success("新增成功");
    } catch (error) {
      ElMessage.error(error || "新增失败，请重试");
    }
  } else {
    // 编辑分类
    try {
      await api.editClassApi(newCategory);
      ElMessage.success("更新成功");
    } catch (error) {
      ElMessage.error(error || "更新失败，请重试");
    }
  }

  dialogVisible.value = false;
};
// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {
      submitFormFn();
    }
  });
};

// 页面加载时获取数据
onMounted(() => {
  loadTableData();
});
</script>

<style scoped>
.classify-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.batch-delete-confirm {
  text-align: center;
  padding: 20px 0;
}

.warning-icon {
  font-size: 48px;
  color: #f56c6c;
  margin-bottom: 15px;
}

.warning-text {
  color: #f56c6c;
  margin-top: 10px;
  font-size: 12px;
}
</style>
