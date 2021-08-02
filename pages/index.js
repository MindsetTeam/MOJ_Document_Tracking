import { Button, Tabs, Modal, Form, Drawer, DatePicker, Select } from "antd";
import moment from "moment";
import { Document, Page, pdfjs } from "react-pdf";
import useTranslation from "next-translate/useTranslation";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import "react-pdf/dist/esm/Page/AnnotationLayer.css";

import { useState } from "react";
import useSWR, { mutate } from "swr";

import AddModal from "../components/document/AddModal";
import DocumentsTable from "../components/document/DocumentsTable";
import OutgoingModal from "../components/document/OutgoingModal";
import LocaleSwitcher from "../components/locale-switcher";
import { useRouter } from "next/router";

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
  const { t } = useTranslation("home");

  const router = useRouter();

  const operations = (
    <>
      <Button
        className="mr-2"
        onClick={() => {
          setPrintModalVisible(true);
        }}
      >
        {t("print")}
      </Button>
      <Button onClick={() => setAddModalVisible(true)}>
        {t("incoming doc")}
      </Button>
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
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const setSelectedDocumentPDF = (record) => {
    setSelectedDocument(record);
    setDrawerVisible(true);
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <section className="max-w-screen-xl mx-auto px-3 ">
      <LocaleSwitcher />
      <AddModal visible={addModalVisible} setVisible={setAddModalVisible} />
      <OutgoingModal
        visible={outgoingModalVisible}
        setVisible={setOutgoingModalVisible}
        handlerOk={handlerOkOutgoing}
      />
      <Modal
        title={t("print")}
        okText={t("ok")}
        cancelText={t("cancel")}
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
            label={t("type")}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select placeholder={t("select a option")}>
              <Option value="Incoming">{t("incoming")}</Option>
              <Option value="Outgoing">{t("outgoing doc")}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="date"
            label={t("date")}
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
        <TabPane tab={t("incoming")} key="1">
          <DocumentsTable
            type="income"
            data={dataIncome}
            outgoing={selectedOutgoing}
            setSelectedDocumentPDF={setSelectedDocumentPDF}
            // setDrawerVisible={setDrawerVisible}
          />
        </TabPane>
        <TabPane tab={t("outgoing doc")} className="text-green-300" key="2">
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
        width={"1200"}
        onClose={() => {
          setDrawerVisible(false);
        }}
        visible={drawerVisible}
      >
        <Tabs tabPosition={"right"}>
          {(selectedDocument?.files || []).map((v, i) => {
            return (
              <TabPane
                tab={v.split("public\\file-uploads\\")[1].slice(0, 24)}
                key={i}
              >
                <Document
                  file={`http://localhost:3001/${v.split("public\\")[1]}`}
                  onLoadSuccess={onDocumentLoadSuccess}
                >
                  <Page pageNumber={pageNumber} />
                </Document>
                <p>
                  Page {pageNumber} of {numPages}
                </p>
              </TabPane>
            );
          })}
        </Tabs>
      </Drawer>
      {/* Print Document */}
      <iframe
        id="printContainer"
        name="printContainer"
        style={{ display: "none" }}
      />
      <div id="printContent" style={{ display: "none" }}>
        <section className="text-center">
          <h1>ព្រះរាជាណាចក្រកម្ពុជា</h1>
          <h1>ជាតិ សាសនា ព្រះមហាក្សត្រ</h1>
          <h1 style={{ fontFamily: "tacteng" }}>6</h1>
        </section>
        {(dataOutgoing || []).map((v, i) => {
          return (
            <h1 key={v._id}>
              {i + 1} - {v.subject}
            </h1>
          );
        })}
        l{" "}
      </div>
      <div className="max-w-lg mx-auto">
        <section className="text-center ">
          <h1>ព្រះរាជាណាចក្រកម្ពុជា</h1>
          <h1>ជាតិ សាសនា ព្រះមហាក្សត្រ</h1>
          <h1 style={{ fontFamily: "tacteng" }}>6</h1>
        </section>
        <section style={{ width: "30%", textAlign: "center" }}>
          <h1>ក្រសួងយុត្តិធម៌</h1>
          <h1>នាយកដ្ឋានកិច្ចការរដ្ឋបាល</h1>
        </section>
        <section className="text-center">
          <h1>លិខិតចូលសម្រាប់ថ្ងៃទី ១៥ ខែ តុលារ ឆ្នាំ ២០២១</h1>
          <table id="printTable" style={{ width: "100%" }}>
            <tr>
              <th style={{ width: "6%"}}>ល.រ</th>
              <th style={{ width: "40%"}}>កម្មវត្ថុ</th>
              <th  style={{ width: "10%"}}>លេខ</th>
              <th style={{ width: "15%"}}>ប្រភព</th>
              <th style={{ width: "15%"}}>ចំនួនច្បាប់</th>
              <th>ផ្សេងៗ</th>
            </tr>
            {Array(15)
              .fill(0)
              .map((v, i) => {
                let returnDom = (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                );
                if (i == 14) {
                  returnDom = (
                    <>
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr key={i + 1}>
                        <td colSpan="4">សរុប</td>
                        <td></td>
                        <td></td>
                      </tr>
                    </>
                  );
                }
                return returnDom;
              })}
          </table>
        </section>
      </div>
    </section>
  );
}
