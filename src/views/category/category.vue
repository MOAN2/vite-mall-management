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
          @change="loadTableData"
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
    stripe
      :data="tableData"
      border
      style="width: 100%"
      v-loading="loading"
      fit
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="家政ID" min-width="80" />
      <el-table-column prop="title" label="家政名称" min-width="120" />
      <!-- <el-table-column label="描述说明" min-width="200">
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
      </el-table-column> -->
      <el-table-column label="所属分类" min-width="150">
        <template #default="scope">
          <el-tag class="category-tag" type="primary" effect="plain">
            {{ getCategoryName(scope.row.categoryId) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否推荐到首页" width="140">
        <template #default="scope">
          {{ scope.row.isRecommend ? "是" : "否" }}
        </template>
      </el-table-column>
      <el-table-column prop="headImg" label="家政主图" width="100">
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
              :key="item.categoryId"
              :label="item.categoryName"
              :value="item.categoryId"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="是否推荐到首页"
          prop="isRecommend"
          label-width="120px"
        >
          <el-switch v-model="form.isRecommend" />
        </el-form-item>
        <el-form-item label="家政主图" prop="headImg">
          <el-upload
            :file-list="headImg"
            :action="uploadUrl"
            list-type="picture-card"
            :limit="1"
            :before-upload="beforeUpload"
            :on-success="handleUploadHead"
            :on-remove="handleRemove"
            :auto-upload="true"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">只能上传 1 张图片，图片不超过2MB</div>
        </el-form-item>
        <el-form-item label="家政轮播图" prop="carousel">
          <el-upload
            :file-list="carousel"
            :action="uploadUrl"
            list-type="picture-card"
            :limit="5"
            :before-upload="beforeUpload"
            :on-success="handleUploadC"
            :on-remove="handleRemoveC"
            :on-exceed="handleExceed"
            :auto-upload="true"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">最多上传5张图片，每张不超过2MB</div>
        </el-form-item>
        <el-form-item label="家政详情图" prop="serviceDetail">
          <el-upload
            :file-list="serviceDetail"
            :action="uploadUrl"
            list-type="picture-card"
            :limit="5"
            :before-upload="beforeUpload"
            :on-success="handleUploadD"
            :on-remove="handleRemoveD"
            :on-exceed="handleExceed"
            :auto-upload="true"
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

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import * as api from "@/api/category.js";
 
import { getAllClassListApi } from "@/api/classify.js";
// 格式化日期函数
const formatDate = (date) => {
  return dayjs(date).format("YYYY/MM/DD HH:mm");
};
const BASE_URL = import.meta.env.VITE_URL;
let uploadUrl = `/api/admin/file/upload`;
// 表格数据
const tableData = ref([]);
const loading = ref(false);
const total = ref(0);
const pageNo = ref(1);
const pageSize = ref(10);

// 分类选项
let categoryOptions = reactive([]);
// 批量删除相关
const batchDeleteDialogVisible = ref(false);
const batchDeleteLoading = ref(false);

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categoryOptions.find(
    (item) => item.categoryId === categoryId
  );

  return category ? category.categoryName : "";
};
const searchValue = ref("");
// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref("add"); // 'add' 或 'edit'
const formRef = ref(null);
const headImg = ref([]);
const serviceDetail = ref([]);
const carousel = ref([]);
const form = reactive({
  title: "",
  categoryId: null,
  headImg: "",
  carousel: [],
  serviceDetail: [],
  isRecommend: false,
});

// 家政保姆选项
const nannyOptions = [
  { value: 1, label: "王阿姨（高级保姆）" },
  { value: 2, label: "李阿姨（家庭保洁）" },
  { value: 3, label: "张阿姨（育婴师）" },
  { value: 4, label: "赵阿姨（养老护理）" },
  { value: 5, label: "刘阿姨（月嫂）" },
];
// 选中行数据
const selectedRows = ref([]);
// 表单验证规则
const rules = {
  title: [
    { required: true, message: "请输入服务名称", trigger: "blur" },
    { min: 1, max: 30, message: "长度在 1 到 30 个字符之间", trigger: "blur" },
  ],
  categoryId: [{ required: true, message: "请选择服务分类", trigger: "blur" }],
};
// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

watch(dialogVisible, (newValue) => {
  if (!newValue) {
    headImg.value = [];
    serviceDetail.value = [];
    carousel.value = [];
  }
});

// 图片上传前验证
const beforeUpload = (file) => {
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 2MB!");
    return false;
  }
  return true;
};
// 处理主图文件上传
const handleUploadHead = (response, file) => {
  if (response && response.code === 200 && response.data) {
    // 替换headImg数据，确保只有服务器返回的图片
    headImg.value = [
      {
        name: file.name,
        url: `${BASE_URL}${response.data}`,
      },
    ];
  }
};

// 处理轮播图文件上传
const handleUploadC = (response, file) => {
  if (response && response.code === 200 && response.data) {
    const imgUrl = response.data;
    carousel.value.push({
        name: file.name,
        url: `${BASE_URL}${imgUrl}`
      });
   
  }
};

// 处理详情图文件上传
const handleUploadD = (response, file) => {
  if (response && response.code === 200 && response.data) {
    const imgUrl = response.data;

    // 避免重复添加，先检查是否存在相同URL的图片
    const exists = serviceDetail.value.some((item) => item.url === imgUrl);
    if (!exists) {
   

      // 添加新上传的图片
      serviceDetail.value.push({
        name: file.name,
        url: `${BASE_URL}${imgUrl}` 
      });
    }
  }
};

// 超出文件上传数量限制
const handleExceed = () => {
  ElMessage.warning("最多只能上传5张图片");
};

// 处理文件移除
const handleRemove = async () => {
  headImg.value = [];
};

// 处理轮播图文件移除
const handleRemoveC = async (file) => {
  const index = carousel.value.findIndex((item) => item.url === file.url);
  if (index !== -1) {
    carousel.value.splice(index, 1);
  }
};

// 处理详情图文件移除
const handleRemoveD = (file) => {
  const index = serviceDetail.value.findIndex((item) => item.url === file.url);
  if (index !== -1) {
    serviceDetail.value.splice(index, 1);
  }
};

// 加载表格数据
const loadTableData = async () => {
  loading.value = true;
  selectedRows.value = []; // 重置选中的行

  try {
    const { data } = await api.getProjectListApi({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      title: searchValue.value,
    });

    tableData.value = data.dataList || [];
    total.value = data.totalCount;
  } catch (error) {
    loading.value = false;
    ElMessage.error(error || "获取数据失败");
  }
  loading.value = false;
};

 
// 页码变化
const handleCurrentChange = async (val) => {
  if (val === pageNo.value) return; // 如果页码没变，不重新加载
  pageNo.value = val;
  await loadTableData();
};

// 每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  loadTableData();
};

// 新增服务
const handleAdd = () => {
  dialogType.value = "add";

  Object.assign(form, {
    title: "",
    categoryId: null,
    headImg: "",
    carousel: [],
    serviceDetail: [],
  });
  dialogVisible.value = true;
};

// 编辑服务
const handleEdit = (row) => {
  dialogType.value = "edit";
  Object.assign(form, row);
  const BASE_URL = import.meta.env.VITE_URL;
  // 处理图片回显
  if (row.headImg) {
    headImg.value = [
      {
        name: "主图",
        url: `${row.headImg}`,
      },
    ];
  } else {
    headImg.value = [];
  }

  if (row.carousel && row.carousel.length > 0) {
    carousel.value = row.carousel.map((url, index) => ({
      name: `轮播图${index + 1}`,
      url: `${url}`,
    }));
  } else {
    carousel.value = [];
  }

  if (row.serviceDetail && row.serviceDetail.length > 0) {
    serviceDetail.value = row.serviceDetail.map((url, index) => ({
      name: `详情图${index + 1}`,
      url: `${url}`,
    }));
  } else {
    serviceDetail.value = [];
  }

  dialogVisible.value = true;
};
const initTable = () => {
  pageSize.value = 10;
  pageNo.value = 1;
  loadTableData();
};
// 删除服务
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除服务"${row.serviceName}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        await api.delProjectApi({ projectIds: [row.id] });

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
// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {
   if(!headImg.value.length ) return ElMessage.warning('主图不能为空')
   if(!carousel.value.length ) return ElMessage.warning('轮播图不能为空')
      // 处理提交前的数据格式转换
      const submitData = { ...form };

      // 处理头图
      if (headImg.value && headImg.value.length > 0) {
        submitData.headImg = headImg.value[0].url;
      } else {
        submitData.headImg = "";
      }

      // 处理轮播图
      if (carousel.value && carousel.value.length > 0) {
        submitData.carousel = carousel.value.map((item) => item.url);
      } else {
        submitData.carousel = [];
      }

      // 处理详情图
      if (serviceDetail.value && serviceDetail.value.length > 0) {
        submitData.serviceDetail = serviceDetail.value.map((item) => item.url);
      } else {
        submitData.serviceDetail = [];
      }

      // 调用API提交
      dialogType.value === "add"
        ? api
            .addProjectApi(submitData)
            .then(() => {
              ElMessage.success("新增成功");
              initTable();
              dialogVisible.value = false;
            })
            .catch((error) => {
              ElMessage.error(error || "新增失败，请重试");
            })
        : api
            .editProjectApi(submitData)
            .then(() => {
              ElMessage.success("更新成功");
              initTable();
              dialogVisible.value = false;
            })
            .catch((error) => {
              ElMessage.error(error || "更新失败，请重试");
            });
    }
  });
};

const loadClass = async () => {
  try {
    const { data } = await getAllClassListApi();
    categoryOptions = data || [];
  } catch (error) {
    console.log("error", error);
  }
};
// 页面加载时获取数据
onMounted(async () => {
  await loadClass();
  await loadTableData();
});
</script>


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
