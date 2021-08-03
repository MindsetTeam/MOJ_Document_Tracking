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
import PrintDom from "../components/PrintDom";

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function Home() {
  const [formPrint] = Form.useForm();
  const [printType, setPrintType] = useState("incoming");
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
        {t("add incoming")}
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
          window.print();
        }}
        confirmLoading={confirmLoadingPrint}
        onCancel={() => {
          setPrintModalVisible(false);
        }}
      >
        <Form
          form={formPrint}
          name="printForm"
          onValuesChange={v=>{
            if(v.documentType){
              setPrintType(v.documentType)
            }
          }}
          initialValues={{
            documentType: printType,
            date: [moment(), moment().add({ day: 1 })],
          }}
        >
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
              <Option value="incoming">{t("incoming")}</Option>
              <Option value="outgoing">{t("outgoing")}</Option>
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
            <RangePicker />
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
        <TabPane tab={t("outgoing")} className="text-green-300" key="2">
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
        title={t("view files", { id: selectedDocument?._id })}
        width={"1000"}
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
                  externalLinkTarget="_blank"
                  onItemClick={({ pageNumber }) =>
                    alert("Clicked an item from page " + pageNumber + "!")
                  }
                  file={`/${v.split("public\\")[1]}`}
                  onLoadSuccess={onDocumentLoadSuccess}
                >
                  <Page pageNumber={pageNumber} width={700} />
                </Document>
                <p>
                  {t("pdf pagination", { pageNumber, numPages })}
                  <a
                    className="text-blue-500 ml-4"
                    target="_blank"
                    rel="noreferrer"
                    href={`/${v.split("public\\")[1]}`}
                  >
                    {t("new tab")}
                  </a>
                </p>
              </TabPane>
            );
          })}
        </Tabs>
      </Drawer>
      {/* Print Document */}
      <PrintDom
        type={printType}
        outgoingData={dataOutgoing}
        incomingData={dataIncome}
      />
    </section>
  );
}
