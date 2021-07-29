import { Button, Tabs, Modal, Form, Drawer, DatePicker, Select } from "antd";
import moment from "moment";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import { useState } from "react";
import useSWR, { mutate } from "swr";

import AddModal from "../components/document/AddModal";
import DocumentsTable from "../components/document/DocumentsTable";
import OutgoingModal from "../components/document/OutgoingModal";

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function Home() {
  const [formPrint] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [outgoingModalVisible, setOutgoingModalVisible] = useState(false);
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [confirmLoadingPrint, setConfirmLoadingPrint] = useState(false);
  const [selectDocumentID, setSelectDocumentID] = useState(null);
  const { data: dataIncome } = useSWR("/api/documents?income=true");
  const { data: dataOutgoing } = useSWR("/api/documents");

  const operations = (
    <>
      <Button
        className="mr-2"
        onClick={() => {
          setPrintModalVisible(true);
        }}
      >
        Print
      </Button>
      <Button onClick={() => setAddModalVisible(true)}>Add Doc</Button>
    </>
  );

  const selectedOutgoing = async (id) => {
    setSelectDocumentID(id);
    setOutgoingModalVisible(true);
  };
  const handlerOkOutgoing = async (departments, callback) => {
    await fetch("/api/documents/" + selectDocumentID, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...departments, outgoingDate: new Date() }),
    });
    callback();
    setOutgoingModalVisible(false);
    mutate("/api/documents?income=true");
    mutate("/api/documents");
  };

  // pdf
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const setSelectedDocumentPDF = (record) => {
    setSelectedDocument(record);
    setDrawerVisible(true);
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <section className="max-w-screen-xl mx-auto px-3 ">
      <AddModal visible={addModalVisible} setVisible={setAddModalVisible} />
      <OutgoingModal
        visible={outgoingModalVisible}
        setVisible={setOutgoingModalVisible}
        handlerOk={handlerOkOutgoing}
      />
      <Modal
        title="Print"
        visible={printModalVisible}
        onOk={() => {
          const printWindow = window.frames["printContainer"];
          printWindow.document.write(`
       <body onload="window.print()" >
       ${document.getElementById("printContent").innerHTML}</body>
       `);
          printWindow.document.close();
        }}
        confirmLoading={confirmLoadingPrint}
        onCancel={() => {
          setPrintModalVisible(false);
        }}
      >
        <Form form={formPrint} name="printForm">
          <Form.Item
            name="documentType"
            label="Type"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select placeholder="Select a option">
              <Option value="Incoming">Incoming</Option>
              <Option value="Outgoing">Outgoing</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="date"
            label="Type"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <RangePicker defaultValue={[moment(), moment().add({ day: 1 })]} />
          </Form.Item>
        </Form>
      </Modal>
      <Tabs tabBarExtraContent={operations}>
        <TabPane tab="Incoming Doc" key="1">
          <DocumentsTable
            type="income"
            data={dataIncome}
            outgoing={selectedOutgoing}
            setSelectedDocumentPDF={setSelectedDocumentPDF}
            // setDrawerVisible={setDrawerVisible}
          />
        </TabPane>
        <TabPane tab="Outgoing Doc" className="text-green-300" key="2">
          <DocumentsTable
            type="outgoing"
            data={dataOutgoing}
            setSelectedDocumentPDF={setSelectedDocumentPDF}
            // setDrawerVisible={setDrawerVisible}
          />
        </TabPane>
      </Tabs>
      <br />
      {/* Drawer */}
      <Drawer
        title="View PDF"
        width={"1000"}
        onClose={() => {
          setDrawerVisible(false);
        }}
        visible={drawerVisible}
      >
         <Tabs tabPosition={'right'}>
          {(selectedDocument?.files||[]).map((v,i)=>{

            return (<TabPane tab={v.split('public\\file-uploads\\')[1]} key={i}>
              <Document
            file={`http://localhost:3000/${v.split('public\\')[1]}`}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page pageNumber={pageNumber} />
          </Document>
          <p>
            Page {pageNumber} of {numPages}
          </p>
            </TabPane>)
          })
            }
          
        </Tabs>
      </Drawer>
      {/* Print Document */}
      <iframe
        id="printContainer"
        name="printContainer"
        style={{ display: "none" }}
      />
      <div id="printContent" style={{ display: "none" }}>
        {(dataOutgoing || []).map((v, i) => {
          return (
            <h1 key={v._id}>
              {i + 1} - {v.subject}
            </h1>
          );
        })}
        l{" "}
      </div>
    </section>
  );
}
