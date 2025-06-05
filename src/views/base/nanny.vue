<template>
  <div class="nanny-container">
    <div class="header">
      <h2>家政保洁人员管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchValue"
          style="width: 240px"
          placeholder="请输入保洁人员名称"
          :prefix-icon="Search"
          clearable
          @change="loadTableData"
        />
        <el-button 
          type="danger" 
          :disabled="selectedRows.length === 0" 
          @click="handleBatchDelete"
        >批量删除</el-button>
        <el-button type="primary" @click="handleAdd">新增保洁人员</el-button>
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
      <el-table-column prop="id" label="ID" min-width="80" />
      <el-table-column prop="name" label="姓名" min-width="120" />
      <el-table-column label="性别" min-width="80">
        <template #default="scope">
          <span>{{ scope.row.gender === 0 ? '男' : '女' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="年龄" min-width="80">
        <template #default="scope">
          <span>{{ scope.row.age || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.phone || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工作年限" min-width="100">
        <template #default="scope">
          <span>{{ scope.row.experienceYears ? `${scope.row.experienceYears}年` : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工作状态" min-width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'primary'">
            {{ scope.row.status === 0 ? '空闲' : '工作中' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="评分" min-width="100">
        <template #default="scope">
          <el-rate
            v-model="scope.row.rating"
            disabled
            show-score
            text-color="#ff9900"
            score-template="{value}"
          />
        </template>
      </el-table-column>
      <el-table-column label="服务分类" min-width="150">
        <template #default="scope">
          <div v-if="scope.row.serviceTypeIds && scope.row.serviceTypeIds.length > 0">
            <el-tag 
              v-for="typeId in scope.row.serviceTypeIds" 
              :key="typeId" 
              class="category-tag"
              type="info"
              effect="plain"
            >
              {{ getCategoryName(typeId) }}
            </el-tag>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="180" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
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
      :title="dialogType === 'add' ? '新增保洁人员' : '编辑保洁人员'"
      width="650px"
      center
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :label="0">男</el-radio>
            <el-radio :label="1">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="form.age" :min="18" :max="65" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" :maxlength="11"/>
        </el-form-item>
        <el-form-item label="工作年限" prop="experienceYears">
          <el-input-number v-model="form.experienceYears" :min="0" :max="50" />
        </el-form-item>
        <el-form-item label="工作状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="空闲" :value="0" />
            <el-option label="工作中" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="评分" prop="rating">
          <el-rate
            v-model="form.rating"
            :max="5"
            :allow-half="true"
            show-score
          />
        </el-form-item>
        <el-form-item label="服务分类" prop="serviceTypeIds">
          <el-select
            v-model="form.serviceTypeIds"
            multiple
            placeholder="请选择服务分类"
          >
            <el-option
              v-for="item in categorySonOptions"
              :key="item.categoryId"
              :label="item.categoryName"
              :value="item.categoryId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确定
          </el-button>
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
        <p>确定要删除选中的 {{ selectedRows.length }} 个保洁人员吗？</p>
        <p class="warning-text">删除后将无法恢复，请谨慎操作！</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDeleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmBatchDelete" :loading="batchDeleteLoading">
            确认删除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, WarningFilled } from '@element-plus/icons-vue';
import * as api from '@/api/base.js'
import { getAllClassListApi } from "@/api/classify.js";

// 表格数据
const tableData = ref([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchValue = ref('');

// 选中行数据
const selectedRows = ref([]);

// 批量删除相关
const batchDeleteDialogVisible = ref(false);
const batchDeleteLoading = ref(false);

// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref('add');
const formRef = ref(null);
const submitLoading = ref(false);

// 分类选项
const categoryOptions = ref([]);
const categorySonOptions = ref([]);

// 表单数据
const form = reactive({
  id: null,
  name: '',
  gender: 0,
  age: 18,
  phone: '',
  experienceYears: 0,
  status: 0,
  rating: 5.0,
  serviceTypeIds: []
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' },{
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入11位正确的手机号",
      trigger: "blur",
    },],
  serviceTypeIds: [{ required: true, message: '请选择服务分类', trigger: 'change' },
    
  ]
};

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categoryOptions.value.find(
    (item) => item.categoryId === categoryId
  );
  return category ? category.categoryName : "";
};

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

// 加载分类数据
const loadClass = async () => {
  try {
    const { data } = await getAllClassListApi();
    categoryOptions.value = data || [];
    categorySonOptions.value = data.filter(i => i.level === 2);
  } catch (error) {
    console.error("加载分类数据失败:", error);
    ElMessage.error("加载分类数据失败");
  }
};

// 加载表格数据
const loadTableData = async () => {
  loading.value = true;
  selectedRows.value = [];

  try {
    const { data } = await api.getNannyApi({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      name: searchValue.value,
    });

    tableData.value = data?.dataList || [];
    total.value = data?.totalCount || 0;
  } catch (error) {
    ElMessage.error(error || "获取数据失败");
  } finally {
    loading.value = false;
  }
};

// 新增
const handleAdd = () => {
  dialogType.value = 'add';
  Object.assign(form, {
    id: null,
    name: '',
    gender: 0,
    age: 18,
    phone: '',
    experienceYears: 0,
    status: 0,
    rating: 5.0,
    serviceTypeIds: []
  });
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row) => {
  dialogType.value = 'edit';
  Object.assign(form, row);
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该保洁人员吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await api.delNannyApi({nannyIds:[row.id]});
      ElMessage.success('删除成功');
      loadTableData();
    } catch (error) {
      ElMessage.error(error || '删除失败');
    }
  });
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return;
  batchDeleteDialogVisible.value = true;
};

// 确认批量删除
const confirmBatchDelete = async () => {
  batchDeleteLoading.value = true;
  try {
    const ids = selectedRows.value.map(row => row.id);
    await api.delNannyApi({nannyIds:ids});
    ElMessage.success(`成功删除${ids.length}个保洁人员`);
    batchDeleteDialogVisible.value = false;
    loadTableData();
  } catch (error) {
    ElMessage.error(error || '批量删除失败');
  } finally {
    batchDeleteLoading.value = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (dialogType.value === 'add') {
          await api.addNannyApi(form);
          ElMessage.success('添加成功');
        } else {
          await api.editNannyApi(form);
          ElMessage.success('更新成功');
        }
        dialogVisible.value = false;
        loadTableData();
      } catch (error) {
        ElMessage.error(error || '操作失败');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
  loadTableData();
};

const handleCurrentChange = (val) => {
  if (val === currentPage.value) return; // 如果页码没变，不重新加载
  currentPage.value = val;
  loadTableData();
};

onMounted(async () => {
  await loadClass();
  await loadTableData();
});
</script>

<style scoped>
.nanny-container {
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

.category-tag {
  margin-right: 5px;
  margin-bottom: 5px;
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