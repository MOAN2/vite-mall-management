<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import * as api from "@/api/category.js";
import {addFileApi,delFileApi} from '@/api/base.js'
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

// 分类选项
// todo
const categoryOptions = [
  { value: 1, label: '日常保洁' },
  { value: 2, label: '深度清洁' },
  { value: 3, label: '家电清洗' },
  { value: 4, label: '厨卫保洁' },
  { value: 5, label: '家居养护' },
  { value: 6, label: '母婴护理' },
  { value: 7, label: '老人照护' }
];
// 批量删除相关
const batchDeleteDialogVisible = ref(false);
const batchDeleteLoading = ref(false);

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categoryOptions.find(item => item.value === categoryId);
  return category ? category.label : '';
};
const searchValue = ref('');
// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref('add'); // 'add' 或 'edit'
const formRef = ref(null);
const serviceDetail = ref([]); // 详情图
const carousel = ref([]); // 轮播图
const headImg = ref(''); // 展示图

const form = reactive({
 "title": "",
  "categoryId": 0,
  "headImg": "",
  "carousel": [],
  "serviceDetail": []
});

// 增值服务选项
const valueAddedServiceOptions = [
  { value: 1, label: '上门洗车' },
  { value: 2, label: '专业除螨' },
  { value: 3, label: '空调清洗' },
  { value: 4, label: '管道疏通' },
  { value: 5, label: '厨卫消毒' }
];

// 家政保姆选项
const nannyOptions = [
  { value: 1, label: '王阿姨（高级保姆）' },
  { value: 2, label: '李阿姨（家庭保洁）' },
  { value: 3, label: '张阿姨（育婴师）' },
  { value: 4, label: '赵阿姨（养老护理）' },
  { value: 5, label: '刘阿姨（月嫂）' }
];
// 选中行数据
const selectedRows = ref([]);
// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入服务名称', trigger: 'blur' },
    { min: 1, max: 30, message: '长度在 1 到 30 个字符之间', trigger: 'blur' }
  ],

};



// 图片上传前验证
const beforeUpload = (file) => {
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 处理展示图文件上传
const handleUploadHead = async({ file }) => {
  try {
    const {data} = await addFileApi({file})
    headImg.value=data
  } catch (error) {
    ElMessage.error('上传失败，请重试')
  }
};
// 处理轮播图文件上传
const handleUploadC = async({ file }) => {
  try {
    const {data} = await addFileApi({file})
    carousel.value=[...carousel.value,data]
  } catch (error) {
    ElMessage.error('上传失败，请重试')
  }
};
// 处理详情图文件上传
const handleUploadD = async({ file }) => {
  try {
    const {data} = await addFileApi({file})
    serviceDetail.value=[...serviceDetail.value,data]
  } catch (error) {
    ElMessage.error('上传失败，请重试')
  }
};
// 超出文件上传数量限制
const handleExceed = () => {
  ElMessage.warning('最多只能上传5张图片');
};

// 处理文件移除
const handleRemove = async (file) => {
  console.log('file',file);
  try {
  await delFileApi({fileId:file.uid})
    headImg.value=''
  } catch (error) {
    ElMessage.error('删除失败，请重试')
  }

};
 
// 处理文件移除
const handleRemoveC = async (file) => {
  console.log('file',file);
  try {
  await delFileApi({fileId:file.uid})
  // todo
 
  } catch (error) {
    ElMessage.error('删除失败，请重试')
  }

};
// 处理文件移除
const handleRemoveD = async (file) => {
  console.log('file',file);
  try {
  await delFileApi({fileId:file.uid})
  // todo
 
  } catch (error) {
    ElMessage.error('删除失败，请重试')
  }

};
// 加载表格数据
const loadTableData = async () => {
  loading.value = true;
  selectedRows.value = []; // 重置选中的行

try {
  const { data } = await api.getProjectListApi({ pageNo:pageNo.value,pageSize:pageSize.value,title:searchValue.value });
  // todo
  // const data = {
  //  "totalCount": 10,
  //   "dataList": [
  //     {
  //       "id": 1,
  //       "createdTime": "2024-05-20T10:00:00Z",
  //       "updatedTime": "2024-05-20T10:00:00Z",
  //       "title": "深度清洁服务",
  //       "categoryId": 1,
  //       "headImg": "http://example.com/headimg1.jpg",
  //       "carousel": ["http://example.com/carousel1.jpg", "http://example.com/carousel2.jpg"],
  //       "serviceDetail": ["http://example.com/detail1.jpg"]
  //     },
  //     {
  //       "id": 2,
  //       "createdTime": "2024-05-21T10:00:00Z",
  //       "updatedTime": "2024-05-21T10:00:00Z",
  //       "title": "日常保洁服务",
  //       "categoryId": 2,
  //       "headImg": "http://example.com/headimg2.jpg",
  //       "carousel": ["http://example.com/carousel3.jpg"],
  //       "serviceDetail": ["http://example.com/detail2.jpg"]
  //     },
  //     {
  //       "id": 3,
  //       "createdTime": "2024-05-22T10:00:00Z",
  //       "updatedTime": "2024-05-22T10:00:00Z",
  //       "title": "家电清洗服务",
  //       "categoryId": 3,
  //       "headImg": "http://example.com/headimg3.jpg",
  //       "carousel": ["http://example.com/carousel4.jpg", "http://example.com/carousel5.jpg"],
  //       "serviceDetail": ["http://example.com/detail3.jpg"]
  //     },
  //     {
  //       "id": 4,
  //       "createdTime": "2024-05-23T10:00:00Z",
  //       "updatedTime": "2024-05-23T10:00:00Z",
  //       "title": "保姆服务",
  //       "categoryId": 4,
  //       "headImg": "http://example.com/headimg4.jpg",
  //       "carousel": ["http://example.com/carousel6.jpg"],
  //       "serviceDetail": ["http://example.com/detail4.jpg"]
  //     },
  //     {
  //       "id": 5,
  //       "createdTime": "2024-05-24T10:00:00Z",
  //       "updatedTime": "2024-05-24T10:00:00Z",
  //       "title": "月嫂服务",
  //       "categoryId": 5,
  //       "headImg": "http://example.com/headimg5.jpg",
  //       "carousel": ["http://example.com/carousel7.jpg"],
  //       "serviceDetail": ["http://example.com/detail5.jpg"]
  //     },
  //     {
  //       "id": 6,
  //       "createdTime": "2024-05-25T10:00:00Z",
  //       "updatedTime": "2024-05-25T10:00:00Z",
  //       "title": "钟点工服务",
  //       "categoryId": 6,
  //       "headImg": "http://example.com/headimg6.jpg",
  //       "carousel": ["http://example.com/carousel8.jpg"],
  //       "serviceDetail": ["http://example.com/detail6.jpg"]
  //     },
  //     {
  //       "id": 7,
  //       "createdTime": "2024-05-26T10:00:00Z",
  //       "updatedTime": "2024-05-26T10:00:00Z",
  //       "title": "玻璃清洁服务",
  //       "categoryId": 7,
  //       "headImg": "http://example.com/headimg7.jpg",
  //       "carousel": ["http://example.com/carousel9.jpg"],
  //       "serviceDetail": ["http://example.com/detail7.jpg"]
  //     },
  //     {
  //       "id": 8,
  //       "createdTime": "2024-05-27T10:00:00Z",
  //       "updatedTime": "2024-05-27T10:00:00Z",
  //       "title": "地毯清洁服务",
  //       "categoryId": 8,
  //       "headImg": "http://example.com/headimg8.jpg",
  //       "carousel": ["http://example.com/carousel10.jpg"],
  //       "serviceDetail": ["http://example.com/detail8.jpg"]
  //     },
  //     {
  //       "id": 9,
  //       "createdTime": "2024-05-28T10:00:00Z",
  //       "updatedTime": "2024-05-28T10:00:00Z",
  //       "title": "沙发清洁服务",
  //       "categoryId": 9,
  //       "headImg": "http://example.com/headimg9.jpg",
  //       "carousel": ["http://example.com/carousel11.jpg"],
  //       "serviceDetail": ["http://example.com/detail9.jpg"]
  //     },
  //     {
  //       "id": 10,
  //       "createdTime": "2024-05-29T10:00:00Z",
  //       "updatedTime": "2024-05-29T10:00:00Z",
  //       "title": "除螨服务",
  //       "categoryId": 10,
  //       "headImg": "http://example.com/headimg10.jpg",
  //       "carousel": ["http://example.com/carousel12.jpg"],
  //       "serviceDetail": ["http://example.com/detail10.jpg"]
  //     }
  //   ]
  // };

  tableData.value = data.dataList || [];
  total.value = data.totalCount;
} catch (error) {
  loading.value = false;
  ElMessage.error(data?.message || "获取数据失败");
}
loading.value = false;
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

// 新增服务
const handleAdd = () => {
  dialogType.value = 'add';
  carousel.value = [];
  Object.assign(form, {
   "title": "",
  "categoryId": 0,
  "headImg": "",
  "carousel": [],
  "serviceDetail": []
  });
  dialogVisible.value = true;
};

// 编辑服务
const handleEdit = (row) => {
  dialogType.value = 'edit';
  Object.assign(form, row);

  // 回填图片列表
  carousel.value = row.images.map((url, index) => ({
    uid: `exist-${index}`,
    name: `图片${index + 1}`,
    url: url,
    status: 'success'
  }));

  dialogVisible.value = true;
};
const initTable = () => {
  pageSize.value = 10;
  pageNo.value = 1;
  loadTableData();
};
// 删除服务
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除服务"${row.serviceName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
        await api.delProjectApi({ projectIds: [row.id] });

        initTable();
        ElMessage.success("删除成功");
      } catch (error) {
        ElMessage.error(error || "删除失败，请重试");
      }
  }).catch(() => {
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
    const selectedIds = selectedRows.value.map((item) => item.id);
    await api.delProjectApi({ projectIds: selectedIds });

    batchDeleteLoading.value = false;
    batchDeleteDialogVisible.value = false;
    selectedRows.value = [];
    initTable();
    ElMessage.success(`成功删除${selectedIds.length}个家政`);
  } catch (error) {
    ElMessage.error(error || "删除失败，请重试");
  }
};

const submitFormFn = async () => {
   // 如果未填写优惠价格，则使用原始价格
   if (form.discountPrice === null || form.discountPrice === undefined) {
        form.discountPrice = form.originalPrice;
      }
  const newCategory = form;
  if (dialogType.value === "add") {
    // 新增分类

    try {
      await api.addProjectApi(newCategory);
      ElMessage.success("新增成功");
    } catch (error) {
      ElMessage.error(error || "新增失败，请重试");
    }
  } else {
    // 编辑分类
    try {
      await api.editProjectApi(newCategory);
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

      submitFormFn()
    }
  });
};

// 页面加载时获取数据
onMounted(() => {
  loadTableData();
});

// 监听dialogVisible，关闭弹窗时重置图片相关变量
watch(dialogVisible, (newVal) => {
  if (!newVal) {
    serviceDetail.value = [];
    carousel.value = [];
    headImg.value = '';
  }
});
</script>

<template>
  <div class="category-container">
    <div class="header">
      <h2>家政服务管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchValue"
          style="width: 240px"
          placeholder="请输入家政名称"
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
        <el-button type="primary" @click="handleAdd">新增服务</el-button>
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
      <el-table-column prop="id" label="家政ID" min-width="80" />
      <el-table-column prop="title" label="家政名称" min-width="120" />
      <el-table-column label="描述说明" min-width="200">
        <template #default="scope">
          <el-tooltip
            v-if="scope.row.description"
            :content="scope.row.description"
            placement="top"
            :show-after="200"
          >
            <div class="description-cell">
              {{ scope.row.description || "-" }}
            </div>
          </el-tooltip>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="所属分类" min-width="150">
        <template #default="scope">
          <el-tag class="category-tag" type="info" effect="plain">
            {{ getCategoryName(category) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="headImg" label="家政展示图" width="100">
        <template #default="scope">
          <div>
            <img :src="scope.row.headImg" width="36" height="36" />
          </div> </template
      ></el-table-column>
      <el-table-column label="创建时间" min-width="180">
        <template #default="scope">
          {{ scope.row.createdTime ? formatDate(scope.row.createdTime) : "-" }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" min-width="180">
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
      :title="dialogType === 'add' ? '新增服务' : '编辑服务'"
      width="700px"
      center
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="服务名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入家政名称" />
        </el-form-item>
        <el-form-item label="服务分类" prop="categoryId">
          <el-select
            v-model="form.categoryId"
            placeholder="请选择家政服务分类"
            style="width: 100%"
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="家政展示图" prop="headImg">
          <el-upload
            v-model:file-list="headImg"
            action="#"
            list-type="picture-card"
            :limit="1"
            :before-upload="beforeUpload"
            :http-request="handleUploadHead"
            :on-remove="handleRemove"
      
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">最图片不超过2MB</div>
        </el-form-item>
        <el-form-item label="家政轮播图" prop="carousel">
          <el-upload
            v-model:file-list="carousel"
            action="#"
            list-type="picture-card"
            :limit="5"
            :before-upload="beforeUpload"
            :http-request="handleUploadC"
            :on-remove="handleRemoveC"
            :on-exceed="handleExceed"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">最多上传5张图片，每张不超过2MB</div>
        </el-form-item>
        <el-form-item label="家政详情图" prop="serviceDetail">
          <el-upload
            v-model:file-list="serviceDetail"
            action="#"
            list-type="picture-card"
            :limit="5"
            :before-upload="beforeUpload"
            :http-request="handleUploadD"
            :on-remove="handleRemoveD"
            :on-exceed="handleExceed"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">最多上传5张图片，每张不超过2MB</div>
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

<style scoped>
.category-container {
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

.description-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.category-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.price-tip {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}
</style>
