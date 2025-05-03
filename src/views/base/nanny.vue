<template>
  <div class="nanny-container">
    <div class="header">
      <h2>家政保姆管理</h2>
      <div class="header-actions">
        <el-button 
          type="danger" 
          :disabled="selectedRows.length === 0" 
          @click="handleBatchDelete"
        >批量删除</el-button>
        <el-button type="primary" @click="handleAdd">新增保姆</el-button>
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
      <el-table-column prop="nannyId" label="保姆ID" min-width="80" />
      <el-table-column prop="nannyName" label="保姆名称" min-width="120" />
      <el-table-column label="保姆简介" min-width="200" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.introduction || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工作状态" min-width="100">
        <template #default="scope">
          <el-tag :type="scope.row.workStatus === 'working' ? 'success' : (scope.row.workStatus === 'resting' ? 'info' : 'warning')">
            {{ 
              scope.row.workStatus === 'working' ? '工作中' : 
              scope.row.workStatus === 'resting' ? '休息中' : 
              scope.row.workStatus === 'leave' ? '请假中' : '-'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="服务分类" min-width="150">
        <template #default="scope">
          <div v-if="scope.row.serviceCategories && scope.row.serviceCategories.length > 0">
            <el-tag 
              v-for="category in scope.row.serviceCategories" 
              :key="category.id" 
              class="category-tag"
              type="info"
              effect="plain"
            >
              {{ category.name }}
            </el-tag>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="年龄" min-width="80">
        <template #default="scope">
          <span>{{ scope.row.age || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工作年限" min-width="100">
        <template #default="scope">
          <span>{{ scope.row.workYears ? `${scope.row.workYears}年` : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.phone || '-' }}</span>
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
      :title="dialogType === 'add' ? '新增保姆' : '编辑保姆'"
      width="650px"
      center
    >
      <!-- 保持原有代码不变 -->
      // ... existing code ...
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
        <p>确定要删除选中的 {{ selectedRows.length }} 个保姆吗？</p>
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
import { Plus, WarningFilled } from '@element-plus/icons-vue';
import * as api from '@/api/base.js'
// 表格数据
const tableData = ref([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 选中行数据
const selectedRows = ref([]);

// 批量删除相关
const batchDeleteDialogVisible = ref(false);
const batchDeleteLoading = ref(false);

// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref('add'); // 'add' 或 'edit'
const formRef = ref(null);
const fileList = ref([]);
const certificatesList = ref([]);
const form = reactive({
  nannyId: null,
  nannyName: '',
  introduction: '',
  workStatus: 'working',
  serviceCategories: [],
  age: 30,
  workYears: 3,
  phone: '',
  avatar: '',
  certificates: []
});

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    return;
  }
  batchDeleteDialogVisible.value = true;
};

// 确认批量删除
const confirmBatchDelete = () => {
  batchDeleteLoading.value = true;
  
  // 模拟删除操作
  setTimeout(() => {
    // 获取所有选中行的ID
    const selectedIds = selectedRows.value.map(item => item.nannyId);
    
    // 过滤掉已选中的行
    tableData.value = tableData.value.filter(item => !selectedIds.includes(item.nannyId));
    
    batchDeleteLoading.value = false;
    batchDeleteDialogVisible.value = false;
    selectedRows.value = [];
    
    ElMessage.success(`成功删除${selectedIds.length}个保姆`);
  }, 1000);
};

// 保持原有代码不变
// ... existing code ...

// 加载表格数据 - 修改这部分以重置选中的行
const loadTableData = () => {
  loading.value = true;
  selectedRows.value = []; // 重置选中的行
  
  // 模拟接口请求
  setTimeout(() => {
    const res = generateMockData(currentPage.value, pageSize.value);
    if (res.success) {
      tableData.value = res.data.dataList;
      total.value = res.data.totalCount;
    } else {
      ElMessage.error(res.message || '获取数据失败');
    }
    loading.value = false;
  }, 500);
};

// ... existing code ...
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