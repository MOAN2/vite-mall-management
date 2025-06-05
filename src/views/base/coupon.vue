<template>
  <div class="coupon-container">
    <div class="header">
      <h2>优惠券管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchValue"
          style="width: 240px"
          placeholder="请输入优惠券名称"
          :prefix-icon="Search"
          clearable
          @change="loadTableData"
        />
        <el-button
          type="danger"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
          >批量删除</el-button
        >
        <el-button type="primary" @click="handleAdd">新增优惠券</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <el-table
      stripe
      :data="tableData"
      border
      style="width: 100%"
      v-loading="loading"
      fit
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="优惠券ID" min-width="100" />
      <el-table-column prop="name" label="优惠券名称" min-width="150" />
      <el-table-column label="启用状态" min-width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status ? 'success' : 'error'">
            {{ scope.row.status ? "启动" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="优惠券类型" min-width="100">
        <template #default="scope">
          <el-tag :type="scope.row.type === '0' ? 'primary' : 'warning'">
            {{ scope.row.type === "0" ? "满减券" : "折扣券" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="面值" min-width="120">
        <template #default="scope">
 
          {{ scope.row.value}}{{ scope.row.type === "0" ? "元" : "折"  }}
        </template>
      </el-table-column>
      <el-table-column label="使用门槛" min-width="120">
        <template #default="scope"> {{ scope.row.threshold }}元 </template>
      </el-table-column>
      <el-table-column label="有效期开始时间" min-width="170">
        <template #default="scope">
          {{ scope.row.startDate ? formatDate(scope.row.startDate) : "-" }}
        </template>
      </el-table-column>
      <el-table-column label="有效期结束时间" min-width="170">
        <template #default="scope">
          {{ scope.row.endDate ? formatDate(scope.row.endDate) : "-" }}
        </template>
      </el-table-column>
      <el-table-column label="领取截止时间" min-width="170">
        <template #default="scope">
          {{ scope.row.deadline ? formatDate(scope.row.deadline) : "-" }}
        </template>
      </el-table-column>
      <el-table-column label="发放总量" min-width="120" prop="total">
      </el-table-column>
      <el-table-column label="剩余数量" min-width="120" prop="remaining">
      </el-table-column>

      <el-table-column label="创建时间" min-width="170">
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
      :title="dialogType === 'add' ? '新增优惠券' : '编辑优惠券'"
      width="550px"
      center
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入优惠券名称" />
        </el-form-item>
        <el-form-item label="发放状态" prop="type">
          <el-select
            v-model="form.type"
            placeholder="请选择优惠券类型"
            style="width: 100%"
          >
            <el-option label="满减券" value="0" />
            <el-option label="折扣券" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="面值" prop="value">
          <el-input-number
            v-if="form.type === '0'"
            v-model="form.value"
            :min="0.01"
            :precision="2"
            style="width: 100%"
            placeholder="请输入面值"
          />
          <el-input-number
            v-else
            v-model="form.value"
            :min="1"
            :precision="1"
            style="width: 100%"
            placeholder="请输入折扣"
          />
        </el-form-item>
        <el-form-item label="使用门槛" prop="threshold">
          <el-input-number
            v-model="form.threshold"
            :min="0.01"
            :precision="2"
            style="width: 100%"
            placeholder="请输入使用门槛"
          />
        </el-form-item>
        <el-form-item label="发放总量" prop="total">
          <el-input-number
            v-model="form.total"
            :min="1"
            :precision="0"
            style="width: 100%"
            placeholder="请输入发放总量"
          />
        </el-form-item>

        <el-form-item label="启用状态" prop="status">
          <el-switch v-model="form.status" />
        </el-form-item>

        <el-form-item label="有效期" required>
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item prop="startDate">
                <el-date-picker
                  v-model="form.startDate"
                  type="date"
                  placeholder="开始日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="endDate">
                <el-date-picker
                  v-model="form.endDate"
                  type="date"
                  placeholder="结束日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          label="领取截止时间"
          required
          prop="deadline"
          label-width="110px"
        >
          <el-date-picker
            v-model="form.deadline"
            type="date"
            placeholder="领取截止时间"
            style="width: 100%"
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
  </div>
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
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import * as api from "@/api/base.js";
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
// 批量删除相关
const batchDeleteDialogVisible = ref(false);
const batchDeleteLoading = ref(false);
// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref("add"); // 'add' 或 'edit'
const formRef = ref(null);
const form = reactive({
  id: 0,
  name: "",
  type: "",
  value: 0,
  threshold: 0,
  startDate: "",
  endDate: "",
  total: 1,
  status: true,
  deadline: "",
});
const searchValue = ref("");
// 选中行数据
const selectedRows = ref([]);
// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};
// 表单验证规则
const rules = {
  name: [
    { required: true, message: "请输入优惠券名称", trigger: "blur" },
    { min: 1, max: 20, message: "长度在 1 到 20 个字符之间", trigger: "blur" },
  ],
  type: [{ required: true, message: "请选择优惠券类型", trigger: "change" }],
  value: [{ required: true, message: "请输入面值", trigger: "blur" }],
  threshold: [
    { required: true, message: "请输入使用门槛金额", trigger: "blur" },
  ],
  total: [{ required: true, message: "请输入发放总量", trigger: "blur" }],

  startDate: [
    {
      type: "date",
      required: true,
      message: "请选择开始日期",
      trigger: "change",
    },
  ],
  endDate: [
    {
      type: "date",
      required: true,
      message: "请选择结束日期",
      trigger: "change",
    },
  ],
  deadline: [
    {
      type: "date",
      required: true,
      message: "请选择截止日期",
      trigger: "change",
    },
  ],
};

// 加载表格数据
const loadTableData = async () => {
  loading.value = true;
  selectedRows.value = []; // 重置选中的行

  try {
    const { data } = await api.getDiscountApi({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      name: searchValue.value,
    });

    tableData.value = data?.dataList || [];
    total.value = Number(data.totalCount) || 0;
  } catch (error) {
    loading.value = false;
    ElMessage.error(error || "获取数据失败");
  }
  loading.value = false;
};

// 页码变化
const handleCurrentChange = (val) => {
  if (val === pageNo.value) return; // 如果页码没变，不重新加载
  pageNo.value = val;
  loadTableData();
};

// 每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  loadTableData();
};

// 新增优惠券
const handleAdd = () => {
  dialogType.value = "add";
  const now = new Date();
  Object.assign(form, {
    id: 0,
    deadline: "",
    name: "",
    type: "",
    value: 0,
    threshold: 0,
    startDate: "",
    endDate: "",
    total: 1,
    status: true,
  });
  dialogVisible.value = true;
};

// 编辑优惠券
const handleEdit = (row) => {
  dialogType.value = "edit";
  Object.assign(form, {
    id: row.id,
    name: row.name,
    type: row.type,
    value: row.value,
    threshold: row.threshold,
    startDate: row.startDate,
    endDate: row.endDate,
    total: row.total,
    status: row.status,
    deadline: row.deadline,
  });
  dialogVisible.value = true;
};
const initTable = () => {
  pageSize.value = 10;
  pageNo.value = 1;
  loadTableData();
};
// 删除优惠券
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除优惠券"${row.name}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await api.delDiscountApi({ couponIds: [row.id] });
      initTable();
      ElMessage.success("删除成功");
    })
    .catch(() => {
      // 取消删除
    });
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {
      // 验证结束日期是否晚于开始日期
      if (form.endDate <= form.startDate) {
        ElMessage.error("结束日期必须晚于开始日期");
        return;
      }

      // 处理提交前的数据格式转换
      const submitData = { ...form };

      // 调用API提交
      dialogType.value === "add"
        ? api
            .addDiscountApi(submitData)
            .then(() => {
              ElMessage.success("新增成功");
              initTable();
              dialogVisible.value = false;
            })
            .catch((error) => {
              ElMessage.error(error || "新增失败，请重试");
            })
        : api
            .editDiscountApi(submitData)
            .then(() => {
              ElMessage.success("更新成功");
              initTable();
              dialogVisible.value = false;
            })
            .catch((error) => {
              ElMessage.error(error || "更新失败，请重试");
            });

      dialogVisible.value = false;
    }
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
    await api.delDiscountApi({ id: selectedIds });

    batchDeleteLoading.value = false;
    batchDeleteDialogVisible.value = false;
    selectedRows.value = [];
    initTable();
    ElMessage.success(`成功删除${selectedIds.length}个广告`);
  } catch (error) {
    ElMessage.error(error || "删除失败，请重试");
  }
};
// 页面加载时获取数据
onMounted(() => {
  loadTableData();
});
</script>

<style scoped>
.coupon-container {
  padding: 20px;
}
.header-actions {
  display: flex;
  gap: 10px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.status-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}
</style>
