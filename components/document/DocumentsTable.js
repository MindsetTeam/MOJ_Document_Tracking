import { Table, Tag, Space } from "antd";
import useTranslation from "next-translate/useTranslation";
import { mutate } from "swr";

const data = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    department: ["nice", "developer"],
    toDepartment: ["nice", "123"],
  },
];

const DocumentsTable = ({
  type,
  data,
  outgoing,
  setSelectedDocumentPDF = { setSelectedDocumentPDF },
}) => {
  const {t} = useTranslation('home')
  const handlerDeleteById = async (id) => {
    await fetch("/api/documents/" + id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    mutate("/api/documents?income=true");
    mutate("/api/documents");
  };
  let columns = [
    {
      title: t('id'),
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: t('subject'),
      dataIndex: "subject",
      key: "subject",
    },
    {
      dataIndex: "files",
      title: t('files'),
      key: "files",
      render: (files, record) => {
        return (
          <a
            onClick={() => {
              setSelectedDocumentPDF(record);
            }}
          >
            {files.map((v) => v.split("public\\file-uploads\\")[1]).join("\n")}
          </a>
        );
      },
    },
    {
      title: t('from'),
      dataIndex: "department",
      key: "department",
      render: (tags) => (
        <>
          {tags.map((tag) => {
            return (
              <Tag color={"green"} key={tag}>
                {tag}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      dataIndex: "note",
      title: t('note'),
      key: "note",
    },
    {
      title: t('action'),
      key: "action",
      render: (text, record) => (
        <Space size="middle" className="text-blue-600">
          {type == "income" ? (
            <a onClick={outgoing.bind(null, record._id)}>{t('outgoing')}</a>
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
                mutate("/api/documents?income=true");
                mutate("/api/documents");
              }}
            >
              {t('restore')}
            </a>
          )}
          <a>{t('edit')}</a>
          <a
            className="text-red-600 hover:text-red-300"
            onClick={() => {
              handlerDeleteById(record._id);
            }}
          >
            {t('delete')}
          </a>
        </Space>
      ),
    },
  ];

  if (type != "income") {
    columns[columns.length - 3] = {
      title: t('to'),
      dataIndex: "toDepartment",
      key: "toDepartment",
      render: (tags) => (
        <>
          {tags.map((tag) => {
            return (
              <Tag color={"teal"} key={tag}>
                {tag}
              </Tag>
            );
          })}
        </>
      ),
    };
  }

  return <Table columns={columns} dataSource={data} />;
};

export default DocumentsTable;
