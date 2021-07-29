import { Table, Tag, Space } from "antd";
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

const DocumentsTable = ({ type, data, outgoing,  setSelectedDocumentPDF={setSelectedDocumentPDF} }) => {
  let columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      dataIndex: "files",
      title: "Files",
      key: "files",
      render: (files,record) => {
        return (
          <a
            onClick={() => {
               setSelectedDocumentPDF(record)
            }}
          >
            {files.map((v) => v.split("public\\file-uploads\\")[1]).join("\n")}
          </a>
        );
      },
    },
    {
      title: "Department",
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
      title: "Note",
      key: "note",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle" className="text-blue-600">
          {type == "income" ? (
            <a onClick={outgoing.bind(null, record._id)}>Outgoing</a>
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
              Restore
            </a>
          )}
          <a>Edit</a>
          <a className="text-red-600 hover:text-red-300">Delete</a>
        </Space>
      ),
    },
  ];

  if (type != "income") {
    columns[columns.length - 3] = {
      title: "To",
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
