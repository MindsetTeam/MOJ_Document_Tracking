import {
  Button,
  Tabs,
  Form,
  Modal,
  Drawer,
  DatePicker,
  Select,
  Space,
  Divider,
  Typography,
} from "antd";
// import 'moment/locale/km';
import moment from "moment";
import { useEffect } from "react";
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
import PrintDom from "../components/PrintDom";
import useDebounce from "../hooks/useDebounce";
import EditModal from "../components/document/EditModal";

const { TabPane } = Tabs;
const { Option } = Select;

export default function Home() {
  const [formPrint] = Form.useForm();
  const [printType, setPrintType] = useState("income");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [outgoingModalVisible, setOutgoingModalVisible] = useState(false);
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [confirmLoadingPrint, setConfirmLoadingPrint] = useState(false);
  const [selectDocumentID, setSelectDocumentID] = useState(null);
  const [printData, setPrintData] = useState([]);
  const [isPrint, setIsPrint] = useState(false);
  // const [typePrint, setTypePrint] = useState("income");
  // const [datePrint, setDatePrint] = useState(moment());
  const [printDate, setPrintDate] = useState(moment().startOf("day"));
  const [printSession, setPrintSession] = useState("morning");
  // const [sessionPrint, setSessionPrint] = useState("afternoon");
  // console.log(datePrint.toLocaleString())
  // const { data: { data: printData } = { data: [] } } = useSWR(
  //   `/api/documents?type=${typePrint}&date=${(sessionPrint === "morning"
  //     ? datePrint
  //     :""
  //     // : datePrint.add(12, "hours")
  //   )}&date=${datePrint}&limit=9999`
  // );

  const { t } = useTranslation("home");
  useEffect(() => {
    if (isPrint && printData) window.print();
  }, [isPrint, printData]);

  const operations = {
    right: (
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
    ),
  };

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
    mutate("/api/documents?type=income&search=&sort=&limit=10&page=1");
    mutate("/api/documents?type=outgoing&search=&sort=&limit=10&page=1");
    mutate("/api/documents/department?type=outgoing");
    mutate("/api/documents/department?type=income");
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
    <section className="max-w-screen-xl mx-auto px-3 pt-2 ">
      <AddModal visible={addModalVisible} setVisible={setAddModalVisible} />
      <OutgoingModal
        visible={outgoingModalVisible}
        setVisible={setOutgoingModalVisible}
        handlerOk={handlerOkOutgoing}
      />
      <div className="flex justify-between">
        {/* <Search
          className="w-1/2 md:w-1/4"
          placeholder={t("searchPlaceholder")}
          loading={!dataIncome || !dataOutgoing}
          onChange={(e) => setSearchValue(e.target.value)}
        /> */}
        <LocaleSwitcher />
      </div>

      <Modal
        title={t("print")}
        okText={t("ok")}
        cancelText={t("cancel")}
        visible={printModalVisible}
        onOk={async () => {
          const printFormData = formPrint.getFieldsValue();
          console.log(printFormData);
          const startDate =
            printFormData.session === "morning"
              ? printFormData.date
              : printFormData.date.clone().add(12, "hours");

          const data = await fetch(
            `/api/documents?type=${
              printFormData.documentType
            }&date=${startDate.toJSON()}&date=${startDate
              .clone()
              .add(12, "hours")
              .toJSON()}&limit=9999`
          ).then((res) => res.json());
          setPrintDate(printFormData.date);
          setPrintSession(printFormData.session);
          setPrintType(printFormData.documentType);
          setPrintData(data.data);

          setIsPrint(true);
          // window.print();
        }}
        confirmLoading={confirmLoadingPrint}
        onCancel={() => {
          setIsPrint(false);
          setPrintModalVisible(false);
        }}
      >
        <Form
          form={formPrint}
          name="printForm"
          // onValuesChange={(v) => {
          //   console.log(v)
          //   if (v.documentType) {
          //     setPrintType(v.documentType);
          //   }
          //   if(v.date){
          //     setDate([]);
          //   }
          // }}
          initialValues={{
            documentType: printType,
            date: printDate,
            session: printSession,
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
              <Option value="income">{t("income")}</Option>
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
            {/* <RangePicker /> */}
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="session"
            label={"Part of Day"}
            rules={[
              {
                required: true,
              },
            ]}
          >
            {/* <RangePicker /> */}
            <Select>
              <Option value="morning">Morning</Option>
              <Option value="afternoon">Afternoon</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Tabs tabBarExtraContent={operations}>
        <TabPane tab={t("income")} key="1">
          <DocumentsTable
            type="income"
            // data={dataIncome}
            outgoing={selectedOutgoing}
            setSelectedDocumentPDF={setSelectedDocumentPDF}
            // setDrawerVisible={setDrawerVisible}
          />
        </TabPane>
        <TabPane tab={t("outgoing")} className="text-green-300" key="2">
          <DocumentsTable
            type="outgoing"
            // data={dataOutgoing}
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
              <TabPane tab={v.split("\\").pop().slice(0, 24)} key={i}>
                <Space split={<Divider type="vertical" />}>
                  {/* <p>{t("pdf pagination", { pageNumber, numPages })}</p> */}
                  <Typography.Link>
                    <a target="_blank" rel="noreferrer" href={v}>
                      {t("new tab")}
                    </a>
                  </Typography.Link>
                  <Typography.Link>
                    <a href={v.split("uploads\\").join("uploads\\download\\")}>
                      Download
                    </a>
                  </Typography.Link>
                </Space>
                <Document
                  externalLinkTarget="_blank"
                  onItemClick={({ pageNumber }) =>
                    alert("Clicked an item from page " + pageNumber + "!")
                  }
                  file={v}
                  // file={`/${v.split("public\\")[1]}`}
                  onLoadSuccess={onDocumentLoadSuccess}
                >
                  <Page pageNumber={pageNumber} width={700} />
                </Document>
              </TabPane>
            );
          })}
        </Tabs>
      </Drawer>
      {/* Print Document */}
      <PrintDom
        type={printType}
        data={printData}
        date={printDate}
        session={printSession}
        // outgoingData={dataOutgoing}
        // incomingData={dataIncome}
      />
    </section>
  );
}
