import Cookies from 'js-cookie'
import Button from "antd/lib/button";
import Link from "next/link";
import { useRouter } from "next/router";
import useTranslation from 'next-translate/useTranslation'

export default function LocaleSwitcher() {
  const router = useRouter();
  const { locales, locale: activeLocale } = router;
  const otherLocales = locales.filter((locale) => locale !== activeLocale);
  const {t}=useTranslation('home')
  
  return (
    <div>
      {t('switch locale')} : 
      {otherLocales.map((locale) => {
        const { pathname, query, asPath } = router;
        console.log({ pathname, query, asPath })
        return (
          <Button key={locale}  onClick={()=>{ 
            Cookies.set('NEXT_LOCALE', locale, {expires: 365})
          }} className="ml-2">
            <Link href={{ pathname, query }} as={asPath} locale={locale}>
              {t(locale).toUpperCase()}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
