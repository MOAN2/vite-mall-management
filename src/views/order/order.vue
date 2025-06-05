<template>
  <div class="order-container">
    <div class="header">
      <h2>订单管理</h2>
      <div class="header-actions">
        <div class="label">订单状态：</div>
        <el-select
          v-model="orderStatus"
          placeholder="请选择订单状态"
          style="width: 100%"
          @change="loadTableData"
        >
          <el-option
            v-for="item in orderStatusOpts"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
    </div>

    <!-- 表格区域 -->
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      v-loading="loading"
      fit
    >
      <el-table-column prop="orderCode" label="订单编号" min-width="120" />
      <el-table-column label="订单状态" min-width="100">
        <template #default="scope">
          <el-tag :type="getOrderStatusType(scope.row.orderStatus)">
            {{ getOrderStatusText(scope.row.orderStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="contactPhone" label="联系电话" min-width="120" />
      <el-table-column label="实际金额" min-width="100">
        <template #default="scope">
          <span>{{ scope.row.realAmount ? `${scope.row.realAmount.toFixed(2)}元` : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优惠金额" min-width="100">
        <template #default="scope">
          <span>{{ scope.row.discountAmount ? `${scope.row.discountAmount.toFixed(2)}元` : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="服务时长" min-width="100">
        <template #default="scope">
          <span>{{ scope.row.serviceDuration ? `${scope.row.serviceDuration}分钟` : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" min-width="150">
        <template #default="scope">
          {{ scope.row.orderTime ? formatDate(scope.row.orderTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="预约时间" min-width="150">
        <template #default="scope">
          {{ scope.row.scheduleTime ? formatDate(scope.row.scheduleTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="100" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleViewDetails(scope.row)">
            查看详情
          </el-button>
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

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailsDialogVisible"
      title="订单详情"
      width="600px"
      center
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">{{ currentOrder.orderCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getOrderStatusType(currentOrder.orderStatus)">
            {{ getOrderStatusText(currentOrder.orderStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="服务类型ID">{{ currentOrder.serviceTypeId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="服务人员ID">{{ currentOrder.nannyId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ currentOrder.orderTime ? formatDate(currentOrder.orderTime) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="预约时间">{{ currentOrder.scheduleTime ? formatDate(currentOrder.scheduleTime) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="服务时长">{{ currentOrder.serviceDuration ? `${currentOrder.serviceDuration}分钟` : '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentOrder.contactPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="订单总金额">{{ currentOrder.totalAmount ? `${currentOrder.totalAmount.toFixed(2)}元` : '-' }}</el-descriptions-item>
        <el-descriptions-item label="优惠金额">{{ currentOrder.discountAmount ? `${currentOrder.discountAmount.toFixed(2)}元` : '-' }}</el-descriptions-item>
        <el-descriptions-item label="实际金额">{{ currentOrder.realAmount ? `${currentOrder.realAmount.toFixed(2)}元` : '-' }}</el-descriptions-item>
        <el-descriptions-item label="客户评分">{{ currentOrder.customerRating || '-' }}</el-descriptions-item>
        <el-descriptions-item label="客户评价" :span="2">{{ currentOrder.customerComment || '-' }}</el-descriptions-item>
        <el-descriptions-item label="服务人员反馈" :span="2">{{ currentOrder.providerFeedback || '-' }}</el-descriptions-item>
        <el-descriptions-item label="服务地址ID">{{ currentOrder.serviceAddressId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="取消原因" :span="2">{{ currentOrder.cancelReason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="取消方">{{ currentOrder.cancelledBy?getCancelText(currentOrder.cancelledBy) : '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import { getOrderListApi } from "@/api/order";

// 格式化日期函数
const formatDate = (date) => {
  return dayjs(date).format("YYYY/MM/DD HH:mm");
};

// 订单状态选项
const orderStatusOpts = [
  { value: -1, label: "全部" },
  { value: 0, label: "待付款" },
  { value: 1, label: "待服务" },
  { value: 2, label: "服务中" },
  { value: 3, label: "已完成" },
  { value: 4, label: "已取消" },
];

// 获取订单状态类型
const getOrderStatusType = (status) => {
  const statusMap = {
    0: 'warning',
    1: 'info',
    2: 'primary',
    3: 'success',
    4: 'danger'
  };
  return statusMap[status] || 'info';
};

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    0: '待付款',
    1: '待服务',
    2: '服务中',
    3: '已完成',
    4: '已取消'
  };
  return statusMap[status] || '未知状态';
};

// 获取取消方文本
const getCancelText = (status) => {
  const statusMap = {
 
    1: '客户',
    2: '管理员',
    3: '系统',
  };
  return statusMap[status] || '未知状态';
};

// 表格数据
const tableData = ref([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const orderStatus = ref(-1);

// 详情弹窗相关
const detailsDialogVisible = ref(false);
const currentOrder = ref({});

// 加载表格数据
const loadTableData = async () => {
  loading.value = true;
  try {
    const { data } = await getOrderListApi({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      orderStatus: orderStatus.value === -1 ? null : orderStatus.value,
    });
    tableData.value = data.dataList || [];
    total.value = Number(data.totalCount);
  } catch (e) {
    console.error("加载订单列表失败:", e);
    ElMessage.error("加载订单列表失败");
  }
  loading.value = false;
};

// 查看订单详情
const handleViewDetails = (row) => {
  currentOrder.value = row;
  detailsDialogVisible.value = true;
};

// 页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadTableData();
};

// 每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  loadTableData();
};

// 页面加载时获取数据
onMounted(() => {
  loadTableData();
});
</script>

<style scoped>
.order-container {
  padding: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
  width: 360px;
  align-items: center;
}

.header-actions .label {
  width: 110px;
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

:deep(.el-descriptions__label) {
  width: 120px;
  justify-content: flex-end;
}
</style>
