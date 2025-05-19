<template>
  <div class="order-container">
    <div class="header">
      <h2>订单管理</h2>
    </div>

    <!-- 表格区域 -->
    <el-table :data="tableData" border style="width: 100%" v-loading="loading" fit>
      <el-table-column prop="orderId" label="订单ID" min-width="80" />
      <el-table-column prop="orderName" label="订单名称" min-width="120" />
      <el-table-column label="订单服务" min-width="150">
        <template #default="scope">
          <div v-if="scope.row.services && scope.row.services.length > 0">
            <el-tag 
              v-for="service in scope.row.services" 
              :key="service.id" 
              class="service-tag"
              type="success"
              effect="plain"
            >
              {{ service.name }}
            </el-tag>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="订单价格" min-width="100">
        <template #default="scope">
          <span>{{ scope.row.orderPrice ? `${scope.row.orderPrice.toFixed(2)}元` : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单家政保姆" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.nanny ? scope.row.nanny.name : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="150">
        <template #default="scope">
          {{ scope.row.createdAt ? formatDate(scope.row.createdAt) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="订单状态" min-width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'completed' ? 'success' : 'warning'">
            {{ scope.row.status === 'completed' ? '已完成' : '未完成' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单地址" min-width="200" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.address || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单人号码" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.customerPhone || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单完成时间" min-width="150">
        <template #default="scope">
          {{ scope.row.completedAt ? formatDate(scope.row.completedAt) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="180" fixed="right">
        <template #default="scope">
          <el-button 
            :type="scope.row.status === 'completed' ? 'info' : 'success'" 
            size="small" 
            @click="handleStatusChange(scope.row)"
          >
            {{ scope.row.status === 'completed' ? '标记未完成' : '标记完成' }}
          </el-button>
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

    <!-- 编辑订单状态弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="更新订单状态"
      width="500px"
      center
    >
      <el-form ref="formRef" :model="form" label-width="100px">
        <el-form-item label="订单状态">
          <el-radio-group v-model="form.status">
            <el-radio label="pending">未完成</el-radio>
            <el-radio label="completed">已完成</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="完成备注" v-if="form.status === 'completed'">
          <el-input
            v-model="form.completionNote"
            type="textarea"
            :rows="3"
            placeholder="请输入完成备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmStatusChange">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';

// 格式化日期函数
const formatDate = (date) => {
  return dayjs(date).format('YYYY/MM/DD HH:mm');
};

// 表格数据
const tableData = ref([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 弹窗相关
const dialogVisible = ref(false);
const formRef = ref(null);
const form = reactive({
  orderId: null,
  status: 'pending',
  completionNote: ''
});

// 家政保姆列表
const nannyList = [
  { id: 1, name: '王阿姨（高级保姆）' },
  { id: 2, name: '李阿姨（家庭保洁）' },
  { id: 3, name: '张阿姨（育婴师）' },
  { id: 4, name: '赵阿姨（养老护理）' },
  { id: 5, name: '刘阿姨（月嫂）' }
];

// 服务列表
const serviceList = [
  { id: 1, name: '日常保洁' },
  { id: 2, name: '深度清洁' },
  { id: 3, name: '家电清洗' },
  { id: 4, name: '厨卫保洁' },
  { id: 5, name: '家居养护' },
  { id: 6, name: '母婴护理' },
  { id: 7, name: '老人照护' }
];

// 生成模拟数据
const generateMockData = (page, limit) => {
  const mockData = [];
  const offset = (page - 1) * limit;
  const count = Math.min(limit, 100 - offset);
  
  const phonePrefix = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
  
  for (let i = 0; i < count; i++) {
    // 随机生成1-3个服务
    const serviceCount = Math.floor(Math.random() * 3) + 1;
    const services = [];
    for (let j = 0; j < serviceCount; j++) {
      const randomService = serviceList[Math.floor(Math.random() * serviceList.length)];
      if (!services.some(s => s.id === randomService.id)) {
        services.push(randomService);
      }
    }
    
    // 随机选择一个家政保姆
    const nanny = nannyList[Math.floor(Math.random() * nannyList.length)];
    
    // 随机生成电话号码
    const prefix = phonePrefix[Math.floor(Math.random() * phonePrefix.length)];
    const suffix = Math.floor(Math.random() * 10000000).toString().padStart(8, '0');
    const phone = `${prefix}${suffix}`;
    
    // 随机生成地址
    const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省'];
    const cities = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '南京市', '成都市', '武汉市'];
    const districts = ['朝阳区', '海淀区', '东城区', '西城区', '浦东新区', '静安区', '天河区', '福田区', '西湖区', '江干区', '武侯区', '锦江区', '江岸区', '洪山区'];
    const streets = ['中关村大街', '长安街', '南京路', '解放路', '人民路', '天目山路', '武林路', '东风路', '建设路', '和平路'];
    
    const province = provinces[Math.floor(Math.random() * provinces.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const number = Math.floor(Math.random() * 100) + 1;
    
    const address = `${province}${city}${district}${street}${number}号`;
    
    // 随机决定订单状态
    const status = Math.random() > 0.3 ? 'completed' : 'pending';
    
    // 生成创建时间和完成时间
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
    let completedAt = null;
    if (status === 'completed') {
      // 完成时间应该晚于创建时间
      completedAt = new Date(createdAt.getTime() + Math.floor(Math.random() * 86400000 * 7)); // 1-7天后完成
    }
    
    const price = (Math.floor(Math.random() * 20000) + 5000) / 100; // 50-250元之间的价格
    
    mockData.push({
      orderId: `ORD${10000 + offset + i}`,
      orderName: `${services.map(s => s.name).join('+')}订单`,
      services: services,
      orderPrice: price,
      nanny: nanny,
      createdAt: createdAt,
      status: status,
      address: address,
      customerPhone: phone,
      completedAt: completedAt,
      completionNote: status === 'completed' ? '客户已确认满意' : ''
    });
  }
  
  return {
    code: 0,
    message: '',
    data: {
      totalCount: 100,
      pageNo: page,
      pageSize: limit,
      dataList: mockData
    },
    success: true
  };
};

// 加载表格数据
const loadTableData = () => {
  loading.value = true;
  
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

// 处理状态变更
const handleStatusChange = (row) => {
  // 简单状态切换
  if (row.status === 'completed') {
    ElMessageBox.confirm(
      `确定要将订单"${row.orderName}"标记为未完成吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      row.status = 'pending';
      row.completedAt = null;
      row.completionNote = '';
      ElMessage.success('订单状态已更新');
    }).catch(() => {
      // 取消操作
    });
  } else {
    // 打开弹窗进行更详细的设置
    form.orderId = row.orderId;
    form.status = 'completed';
    form.completionNote = '';
    dialogVisible.value = true;
  }
};

// 确认状态变更
const confirmStatusChange = () => {
  const row = tableData.value.find(item => item.orderId === form.orderId);
  if (row) {
    row.status = form.status;
    if (form.status === 'completed') {
      row.completedAt = new Date();
      row.completionNote = form.completionNote;
    } else {
      row.completedAt = null;
      row.completionNote = '';
    }
    ElMessage.success('订单状态已更新');
  }
  dialogVisible.value = false;
};

// 删除订单
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除订单"${row.orderName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实际项目中这里需要调用接口删除数据
    const index = tableData.value.findIndex(item => item.orderId === row.orderId);
    if (index !== -1) {
      tableData.value.splice(index, 1);
      ElMessage.success('删除成功');
    }
  }).catch(() => {
    // 取消删除
  });
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

.service-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>
