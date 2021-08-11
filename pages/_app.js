import "../styles/globals.css";
import { SWRConfig } from "swr";
import useTranslation from "next-translate/useTranslation";
import { ConfigProvider } from "antd";
import "moment/locale/km";

function MyApp({ Component, pageProps }) {
  const { t, lang } = useTranslation("home");
  console.log(lang);
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) =>
          fetch(resource, init).then((res) => res.json()),
      }}
    >
      <ConfigProvider
        locale={{
          Pagination: {
            items_per_page: t("itemPerPage"),
            jump_to: "លោត​ទៅ",
            jump_to_confirm: "បញ្ជាក់",
            page: "ទំព័រ",
            prev_page: "ទំព័រ​មុន",
            next_page: "ទំព័រ​​បន្ទាប់",
            prev_5: "៥ ទំព័រថយក្រោយ",
            next_5: "៥ ទំព័រទៅមុខ",
            prev_3: "៣ ទំព័រថយក្រោយ",
            next_3: "៣ ទំព័រទៅមុខ",
          },
          Empty: {
            description: t("empty"),
          },
          Modal: {
            okText: t("ok"),
            cancelText: t("cancel"),
            justOkText: t("ok"),
          },
          DatePicker: {
            lang: {
              locale: lang,
              placeholder: t("datePlaceholder"),
              rangePlaceholder: [t("startDate"), t("endDate")],
              today: "ថ្ងៃនេះ",
              now: "Now",
              backToToday: "Back to today",
              ok: t("ok"),
              clear: "Clear",
              month: "Month",
              year: "Year",
              timeSelect: "Select time",
              dateSelect:  t("datePlaceholder"),
              monthSelect: "Choose a month",
              yearSelect: "Choose a year",
              decadeSelect: "Choose a decade",
              yearFormat: "YYYY",
              dateFormat: "M/D/YYYY",
              dayFormat: "D",
              dateTimeFormat: "M/D/YYYY HH:mma",
              monthFormat: "MMMM",
              monthBeforeYear: true,
              previousMonth: "Previous month (PageUp)",
              nextMonth: "Next month (PageDown)",
              previousYear: "Last year (Control + left)",
              nextYear: "Next year (Control + right)",
              previousDecade: "Last decade",
              nextDecade: "Next decade",
              previousCentury: "Last century",
              nextCentury: "Next century",
            },
            timePickerLocale: {
              placeholder: "Select time",
            },
            dateFormat: "DD-MM-YYYY",
            dateTimeFormat: "DD-MM-YYYY hh:mma",
            weekFormat: "wo-YYYY",
            monthFormat: "MM-YYYY",
          },
        }}
      >
        <Component {...pageProps} />
      </ConfigProvider>
    </SWRConfig>
  );
}

export default MyApp;
