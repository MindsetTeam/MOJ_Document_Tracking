import {
  Table,
  Tag,
  Space,
  Row,
  Col,
  Input,
  Form,
  DatePicker,
  Button,
  Select,
  ConfigProvider,
} from "antd";

// import locale from 'antd/lib/locale/kmr_IQ';
import moment from "moment";
import useTranslation from "next-translate/useTranslation";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import EditModal from "./EditModal";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { useForm } = Form;

const DocumentsTable = ({
  type,
  outgoing,
  setSelectedDocumentPDF = { setSelectedDocumentPDF },
}) => {
  const [searchForm] = useForm();
  const [searchValue, setSearchValue] = useState("");
  const [date, setDate] = useState([]);
  const [createdAtOrder, setCreatedAtOrder] = useState("");
  const [numberOrder, setNumberOrder] = useState("");
  const [department, setDepartment] = useState([]);
  const debounceValue = useDebounce(searchValue, 500);

  // pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: { data: incomeData, total: totalIncomeData } = { data: [], total: 0 },
  } = useSWR(
    type === "income"
      ? "/api/documents?type=income&search=" +
          debounceValue +
          department.map((v) => `&department=${v}`).join("&") +
          date.map((v) => `&date=${v.toJSON()}`).join("&") +
          "&sort=" +
          (createdAtOrder === "ascend"
            ? "createdAt"
            : numberOrder === "ascend"
            ? "number"
            : numberOrder === "descend"
            ? "-number"
            : "") +
          "&limit=" +
          pageSize +
          "&page=" +
          currentPage
      : null,
    {
      refreshInterval: 1000,
    }
  );
  const {
    data: { data: outgoingData, total: totalOutgoingData } = {
      data: [],
      total: 0,
    },
  } = useSWR(
    type === "outgoing"
      ? "/api/documents?type=outgoing&search=" +
          debounceValue +
          department.map((v) => `&department=${v}`).join("&") +
          date.map((v) => `&date=${v.toJSON()}`).join("&") +
          "&sort=" +
          (createdAtOrder === "ascend"
            ? "createdAt"
            : numberOrder === "ascend"
            ? "number"
            : numberOrder === "descend"
            ? "-number"
            : "") +
          "&limit=" +
          pageSize +
          "&page=" +
          currentPage
      : null,
    {
      refreshInterval: 1000,
    }
  );
  // caches page 2
  useSWR(
    type === "income"
      ? "/api/documents?type=income&search=" +
          debounceValue +
          department.map((v) => `&department=${v}`).join("&") +
          date.map((v) => `&date=${v.toJSON()}`).join("&") +
          "&sort=" +
          (createdAtOrder === "ascend"
            ? "createdAt"
            : numberOrder === "ascend"
            ? "number"
            : numberOrder === "descend"
            ? "-number"
            : "") +
          "&limit=" +
          pageSize +
          "&page=" +
          (+currentPage + 1)
      : null
  );
  useSWR(
    type === "outgoing"
      ? "/api/documents?type=outgoing&search=" +
          debounceValue +
          department.map((v) => `&department=${v}`).join("&") +
          date.map((v) => `&date=${v.toJSON()}`).join("&") +
          "&sort=" +
          (createdAtOrder === "ascend"
            ? "createdAt"
            : numberOrder === "ascend"
            ? "number"
            : numberOrder === "descend"
            ? "-number"
            : "") +
          "&limit=" +
          pageSize +
          "&page=" +
          (+currentPage + 1)
      : null
  );

  const { data: { data: departmentsData } = { data: [] } } = useSWR(
    type == "outgoing"
      ? "/api/documents/department?type=outgoing"
      : "/api/documents/department?type=income",
    { refreshInterval: 60000 }
  );
  // Array(200)
  //   .fill(0)
  //   .forEach((element, i) => {
  //     (type === "income" ? incomeData : outgoingData).push({
  //       subject: i,
  //       files: [],
  //       department: [],
  //       toDepartment: [],
  //     });
  //   });

  const handlerFilterChange = (changedValue, allValues) => {
    console.log(changedValue);
  };

  const { t } = useTranslation("home");
  const handlerDeleteById = async (id) => {
    await fetch("/api/documents/" + id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    mutate("/api/documents?type=income&search=&sort=&limit=10&page=1");
    mutate("/api/documents?type=outgoing&search=&sort=&limit=10&page=1");
    mutate("/api/documents/department?type=outgoing");
    mutate("/api/documents/department?type=income");
  };

  const handleTableChange = (pagination, filters, sorter) => {
    // if (Array.isArray(sorter)) {
    //   sorter.forEach((v) => {
    //     v.columnKey == "createdAt" && setCreatedAtOrder(v.order || "");
    //     v.columnKey == "number" && setNumberOrder(v.order || "");
    //   });
    // } else {
    // sorter.columnKey == "createdAt" && setCreatedAtOrder(sorter.order || "");
    // sorter.columnKey == "number" && setNumberOrder(sorter.order || "");
    // }
    setPageSize(pagination.pageSize);
    setCurrentPage(pagination.current);
    if (sorter.columnKey == "createdAt") {
      setCreatedAtOrder(sorter.order);
      setNumberOrder("");
    }
    if (sorter.columnKey == "number") {
      setNumberOrder(sorter.order);
      setCreatedAtOrder("");
    }
  };

  let columns = [
    {
      title: t("number"),
      dataIndex: "number",
      key: "number",
      sorter: true,
      sortOrder: numberOrder,
    },
    {
      title: t("subject"),
      dataIndex: "subject",
      key: "subject",
    },

    {
      dataIndex: "files",
      title: t("files"),
      key: "files",
      render: (files, record) => {
        return (
          <a
            className="text-blue-500"
            onClick={() => {
              setSelectedDocumentPDF(record);
            }}
          >
            {files
              .map((v) =>
                v
                  .split("\\")
                  .pop()
                  .replace(/-\w{5}\./, ".")
              )
              .join(" | ")}
          </a>
        );
      },
    },
    {
      title: t("from"),
      dataIndex: "department",
      key: "department",
      render: (tags) => (
        <>
          {tags.map((tag, i) => {
            return (
              <Tag color={"green"} key={i}>
                {tag}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      dataIndex: "note",
      title: t("note"),
      key: "note",
    },
    {
      title: t("date"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString("en-GB"),
      sorter: true,

      sortOrder: createdAtOrder,
      sortDirections: ["ascend"],
    },
    {
      title: t("action"),
      key: "action",
      render: (text, record) => (
        <Space size="middle" className="text-blue-600">
          {type == "income" ? (
            <a onClick={outgoing.bind(null, record._id)}>{t("toOutgoing")}</a>
          ) : (
            <a
              onClick={async () => {
                await fetch("/api/documents/" + record._id, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    toDepartment: [],
                    outgoingDate: null,
                  }),
                });
                mutate(
                  "/api/documents?type=income&search=&sort=&limit=10&page=1"
                );
                mutate(
                  "/api/documents?type=outgoing&search=&sort=&limit=10&page=1"
                );
                mutate("/api/documents/department?type=outgoing");
                mutate("/api/documents/department?type=income");
              }}
            >
              {t("restore")}
            </a>
          )}
          <a
            onClick={() => {
              setSelectedEditData(record);
              setEditModalVisible(true);
            }}
          >
            {t("edit")}
          </a>
          <a
            className="text-red-600 hover:text-red-300"
            onClick={() => {
              handlerDeleteById(record._id);
            }}
          >
            {t("delete")}
          </a>
        </Space>
      ),
    },
  ];

  if (type != "income") {
    columns[columns.length - 4] = {
      title: t("to"),
      dataIndex: "toDepartment",
      key: "toDepartment",
      render: (tags) => (
        <>
          {tags.map((tag, i) => {
            return (
              <Tag color={"teal"} key={i}>
                {tag}
              </Tag>
            );
          })}
        </>
      ),
    };
  }

  // triggerDesc: 'Click sort by descend',
  // triggerAsc: 'Click sort by ascend',
  // cancelSort: 'Click to cancel sort',
  const [selectedEditData, setSelectedEditData] = useState({})
  const [editModalVisible, setEditModalVisible] = useState(false)
  const onCloseEditModal = () => {
    setSelectedEditData({})
    setEditModalVisible(false)
  }
  return (
    <div>
      <EditModal data={selectedEditData} visible={editModalVisible} onClose={onCloseEditModal} />
      <Table
        pagination={{
          total: type === "income" ? totalIncomeData : totalOutgoingData,
          pageSize,
          current: currentPage,
        }}
        rowKey={(record) => {
          return record._id;
        }}
        locale={{
          triggerAsc: "Asc",
          triggerDesc: "desc",
          cancelSort: "cancel",
        }}
        title={() => (
          <Form
            form={searchForm}
            className="-mt-4"
            onValuesChange={handlerFilterChange}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="search" className="mb-0" label="Search">
                  <Search
                    allowClear
                    onChange={(e) => {
                      setSearchValue(e.target.value || "");
                    }}
                    placeholder={t("searchPlaceholder")}
                    loading={type === "income" ? !incomeData : !outgoingData}
                  />
                </Form.Item>
              </Col>
              <Col span="8">
                <Form.Item name="date" label={t("date")} className="mb-0">
                  <RangePicker
                    ranges={{
                      Yesterday: [
                        moment().subtract(1, "day").startOf("day"),
                        moment().subtract(1, "day").endOf("day"),
                      ],
                      Today: [moment().startOf("day"), moment().endOf("day")],
                      Morning: [
                        moment().startOf("day"),
                        moment().startOf("day").add(12, "hours"),
                      ],
                      Afternoon: [
                        moment().startOf("day").add(12, "hours"),
                        moment().startOf("day").add(24, "hours"),
                      ],
                      "This Week": [
                        moment().startOf("week"),
                        moment().endOf("week"),
                      ],
                      "ខែ Month": [
                        moment().startOf("month"),
                        moment().endOf("month"),
                      ],
                    }}
                    onChange={(v) => {
                      setDate(v || []);
                    }}
                    showNow
                    showTime
                    placeholder={["start", "end"]}
                  />
                </Form.Item>
              </Col>
              <Col span="8">
                <Form.Item
                  name="department"
                  label={t("department")}
                  className="mb-0"
                >
                  <Select
                    mode="multiple"
                    allowClear
                    onChange={(v) => {
                      setDepartment(v || []);
                    }}
                    style={{ width: "100%" }}
                    placeholder={t("department name")}
                  >
                    {departmentsData.map((v, i) => {
                      return (
                        <Option value={v} key={i}>
                          {v}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span="24" className="text-right mt-2">
                <Button
                  onClick={() => {
                    setSearchValue("");
                    setDate([]);
                    setDepartment([]);
                    setCreatedAtOrder("");
                    setNumberOrder("");
                    searchForm.resetFields();
                  }}
                >
                  Clear All Filter
                </Button>
              </Col>
            </Row>
          </Form>
        )}
        columns={columns}
        dataSource={type === "income" ? incomeData : outgoingData}
        loading={false}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default DocumentsTable;
