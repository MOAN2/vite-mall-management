<template>
  <div class="service-container">
    <div class="header">
      <h2>家政加购项管理</h2>
      <div class="header-actions">
        <el-button
          type="danger"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
          >批量删除</el-button
        >
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      v-loading="loading"
      fit
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" min-width="80" sortable />
      <el-table-column prop="detail" label="加购项描述" min-width="150" />
      <el-table-column label="预估价格" min-width="120">
        <template #default="scope">
          <span>{{
            scope.row.estimatedPrice
              ? `￥${scope.row.estimatedPrice.toFixed(2)}`
              : "-"
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="原始价格" min-width="120">
        <template #default="scope">
          <span>{{
            scope.row.realPrice ? `￥${scope.row.realPrice.toFixed(2)}` : "-"
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="加购项销量" min-width="120" prop="sales">
      </el-table-column>

      <el-table-column label="所属家政" min-width="150">
        <template #default="scope">
          <span>
            {{
              scope.row.projectId ? getProjectName(scope.row.projectId) : "-"
            }}</span
          >
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="170" sortable>
        <template #default="scope">
          {{ scope.row.createdTime ? formatDate(scope.row.createdTime) : "-" }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" min-width="170">
        <template #default="scope">
          {{ scope.row.updatedTime ? formatDate(scope.row.updatedTime) : "-" }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="180" fixed="right">
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
      :title="dialogType === 'add' ? '新增加购项' : '编辑加购项'"
      width="550px"
      center
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="加购项描述说明" prop="detail">
          <el-input v-model="form.detail" placeholder="请输入加购项名称" />
        </el-form-item>
        <el-form-item label="预估价格" prop="estimatedPrice">
          <el-input-number
            v-model="form.estimatedPrice"
            :min="0"
            :precision="2"
            :step="1"
            style="width: 100%"
            placeholder="请输入预估价格"
          />
        </el-form-item>
        <el-form-item label="原始价格" prop="realPrice">
          <el-input-number
            v-model="form.realPrice"
            :min="0"
            :precision="2"
            :step="1"
            style="width: 100%"
            placeholder="请输入原始价格"
          />
        </el-form-item>
        <el-form-item label="加购项单位" prop="sku">
          <el-input v-model="form.sku" placeholder="请输入加购项单位" />
        </el-form-item>
        <el-form-item label="价格所属家政" prop="projectId">
          <el-select
            v-model="form.projectId"
            placeholder="请选择所属家政"
            style="width: 100%"
          >
            <el-option
              v-for="item in projectOptions"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </el-select>
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
        <p>确定要删除选中的 {{ selectedRows.length }} 个加购项吗？</p>
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
import * as api from "@/api/base.js";
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { WarningFilled } from "@element-plus/icons-vue";
import dayjs from "dayjs";
// 分类选项
let projectOptions = reactive([]);
// 格式化日期函数
const formatDate = (date) => {
  return dayjs(date).format("YYYY/MM/DD HH:mm");
};

// 表格数据
const tableData = ref([]);
const loading = ref(false);
const total = ref(0);
const pageNo = ref(1);
const pageSize = ref(10);

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
  projectId: null,
  sku: "",
  detail: "",
  estimatedPrice: 0,
});

// 表单验证规则
const rules = {
  detail: [
    { required: true, message: "请输入加购项名称" },
    { min: 1, max: 20, message: "长度在 1 到 20 个字符之间", trigger: "blur" },
  ],

  realPrice: [{ required: true, message: "请输入加购项", trigger: "blur" }],
  projectId: [{ required: true, message: "请选择所属家政", trigger: "blur" }],
  sku: [
    { required: true, message: "请输入加购项单位", trigger: "blur" },
    { min: 1, max: 10, message: "长度在 1 到 10 个字符之间", trigger: "blur" },
  ],
};

const getProjectName = (id) => {
  const category = projectOptions.find((item) => item.id === id);

  return category ? category.title : "";
};
// 加载表格数据
const loadTableData = async () => {
  loading.value = true;
  selectedRows.value = []; // 重置选中的行
  try {
    const { data } = await api.getPriceServiceApi({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
    });

    tableData.value = data?.dataList || [];
    total.value = data?.totalCount || 0;
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

// 新增加购项
const handleAdd = () => {
  dialogType.value = "add";
  Object.assign(form, {
    projectId: null,
    sku: "",
    detail: "",
    estimatedPrice: 0,
    realPrice: 0,
  });
  dialogVisible.value = true;
};

// 编辑加购项
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
// 删除加购项
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除加购项"${row.detail}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        await api.delPriceServiceApi({ projectPriceIds: [row.id] });
        initTable();

        ElMessage.success("删除成功");
      } catch (error) {
        ElMessage.error(error || "删除失败，请重试");
      }
    })
    .catch(() => {
      // 取消删除
      ElMessage.error("删除失败，请重试");
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
    const selectedIds = selectedRows.value.map((item) => item.id);

    await api.delPriceServiceApi({ projectPriceIds: selectedIds });
    batchDeleteLoading.value = false;
    batchDeleteDialogVisible.value = false;
    selectedRows.value = [];

    await loadTableData();
    ElMessage.success(`成功删除${selectedIds.length}个加购项`);
  } catch (error) {
    ElMessage.error(error || "删除失败，请重试");
  }
};

// 提交表单
const submitForm = () => {
  if (!formRef.value) return;

  formRef.value.validate((valid) => {
    if (valid) {
      submitFormFn();
    }
  });
};

const submitFormFn = async () => {
  const newService = {
    ...form,
    projectId: form.projectId,
    detail: form.detail,
    sku: form.sku,
    estimatedPrice: form.estimatedPrice,
    realPrice: form.realPrice,
  };
  if (
    newService.estimatedPrice > 0 &&
    newService.realPrice <= newService.estimatedPrice
  )
    return ElMessage.warning("预估价格不能大于原始价格");
  if (dialogType.value === "add") {
    // 新增加购项

    try {
      await api.addPriceServiceApi(newService);
      initTable();
      ElMessage.success("新增成功");
    } catch (error) {
      ElMessage.error(error || "新增失败，请重试");
    }
    tableData.value.unshift(newService);
  } else {
    // 编辑加购项

    try {
      await api.editPriceServiceApi({ ...newService, id: form.id });
      initTable();
      ElMessage.success("编辑成功");
    } catch (error) {
      ElMessage.error(error || "新增失败，请重试");
    }
  }
  initTable();
  dialogVisible.value = false;
};
const loadProject = async () => {
  try {
    const { data } = await api.getAllProjecteApi();
    projectOptions = data || [];
  } catch (error) {
    console.log("error", error);
  }
};
// 页面加载时获取数据
onMounted(async () => {
  await loadTableData();
  await loadProject();
});
</script>

<style scoped>
.service-container {
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
