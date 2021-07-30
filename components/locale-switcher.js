import Button from "antd/lib/button";
import Link from "next/link";
import { useRouter } from "next/router";

export default function LocaleSwitcher() {
  const router = useRouter();
  const { locales, locale: activeLocale } = router;
  const otherLocales = locales.filter((locale) => locale !== activeLocale);

  return (
    <div>
      Locale switcher:
      {otherLocales.map((locale) => {
        const { pathname, query, asPath } = router;
        return (
          <Button key={locale}>
            <Link href={{ pathname, query }} as={asPath} locale={locale}>
              {locale.toUpperCase()}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
