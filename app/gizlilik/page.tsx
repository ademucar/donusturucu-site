import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — Çeviriyo",
  description: "Dosyalarınız cihazınızdan çıkmaz. Çeviriyo'nun gizlilik politikası.",
};

const UPDATED = "15 Ağustos 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-400">{children}</div>
    </section>
  );
}

export default function Privacy() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-[clamp(1rem,4vh,2rem)] text-center">
        <h1 className="text-[clamp(1.5rem,5.5vmin,2.25rem)] font-bold tracking-tight text-white">
          Gizlilik <span className="text-gradient">Politikası</span>
        </h1>
        <p className="mt-2 text-[clamp(0.85rem,2.6vmin,1rem)] text-slate-400">
          Son güncelleme: {UPDATED}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-[clamp(0.9rem,3.5vmin,2rem)] shadow-2xl shadow-black/40">
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <p className="text-sm leading-relaxed text-slate-300">
            <strong className="text-white">Özet:</strong> Yüklediğiniz dosyalar sunucularımıza
            gönderilmez. Tüm dönüştürme işlemleri kendi cihazınızın tarayıcısında yapılır.
            Dosyalarınızı görmüyor, saklamıyor ve kimseyle paylaşmıyoruz.
          </p>
        </div>

        <Section title="Veri sorumlusu">
          <p>
            Bu site, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu
            sıfatıyla <strong className="text-slate-300">Adem Uçar</strong> tarafından
            işletilmektedir. Her türlü soru ve talebiniz için sayfanın sonundaki iletişim
            adresinden ulaşabilirsiniz.
          </p>
        </Section>

        <Section title="Dosyalarınıza ne oluyor?">
          <p>
            Çeviriyo&apos;daki tüm araçlar (görsel dönüştürme, kırpma, boyutlandırma, sıkıştırma,
            PDF birleştirme, sayfa seçme ve PDF&ndash;görsel dönüşümleri) tamamen tarayıcınızın
            içinde çalışır. Seçtiğiniz dosya internete hiçbir şekilde yüklenmez.
          </p>
          <p>
            İşlem bittiğinde sonuç doğrudan cihazınıza indirilir. Sekmeyi kapattığınızda geriye
            hiçbir veri kalmaz; dosyalarınızın bir kopyası bizde oluşmaz.
          </p>
          <p>
            Bunu kendiniz de doğrulayabilirsiniz: tarayıcınızın geliştirici araçlarındaki
            &quot;Network&quot; sekmesini açıp bir dosya dönüştürün &mdash; dosyanızın gönderildiği
            hiçbir istek göremezsiniz. Hatta internet bağlantınızı kesip de kullanabilirsiniz.
          </p>
        </Section>

        <Section title="Hangi verileri topluyoruz?">
          <p>
            <strong className="text-slate-300">Biz hiçbir kişisel veri toplamıyoruz.</strong> Sitede
            üyelik, giriş, form veya iletişim alanı bulunmuyor. Adınızı, e-postanızı veya
            dosyalarınızın içeriğini istemiyoruz ve kaydetmiyoruz.
          </p>
          <p>
            Sitede analitik veya izleme aracı (Google Analytics vb.) kullanılmamaktadır.
          </p>
        </Section>

        <Section title="Çerezler">
          <p>
            Çeviriyo çerez kullanmaz. Reklam, izleme veya profilleme amaçlı hiçbir çerez
            yerleştirilmez. Bu nedenle karşınıza çerez onay penceresi çıkmaz.
          </p>
        </Section>

        <Section title="Barındırma ve teknik kayıtlar">
          <p>
            Site, Vercel Inc. (ABD) altyapısı üzerinde barındırılmaktadır. Tüm web sitelerinde
            olduğu gibi, barındırma sağlayıcısı güvenlik ve hizmetin sürekliliği amacıyla teknik
            erişim kayıtları (IP adresi, tarayıcı türü, istek zamanı gibi) tutabilir. Bu kayıtlar
            Vercel tarafından kendi gizlilik politikası kapsamında işlenir.
          </p>
          <p>
            Siteyi ziyaret ettiğinizde bağlantı bilgileriniz teknik olarak yurt dışındaki bu
            sunuculara ulaşır. Ancak <strong className="text-slate-300">dosyalarınız bu kapsamda
            değildir</strong>: dosyalarınız sunucuya hiçbir zaman gönderilmediği için ne bizim ne
            de barındırma sağlayıcısının erişimine açıktır.
          </p>
          <p>
            Sitede kullanılan yazı tipleri kendi sunucumuzdan sunulmaktadır; bu nedenle üçüncü
            taraf font servislerine (Google Fonts gibi) istek gönderilmez.
          </p>
        </Section>

        <Section title="Üçüncü taraf bağlantıları">
          <p>
            Sitede geliştiriciye ait bir web sitesine bağlantı bulunmaktadır. Bu bağlantıya
            tıkladığınızda ilgili sitenin kendi gizlilik politikası geçerli olur.
          </p>
        </Section>

        <Section title="KVKK kapsamındaki haklarınız">
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun 11. maddesi uyarınca kişisel
            verilerinizle ilgili bilgi talep etme, düzeltilmesini veya silinmesini isteme
            haklarına sahipsiniz.
          </p>
          <p>
            Uygulamada, tarafımızca saklanan herhangi bir kişisel veriniz bulunmadığı için
            silinecek bir kaydınız da bulunmamaktadır. Yine de her türlü soru ve talebiniz için
            bize ulaşabilirsiniz.
          </p>
        </Section>

        <Section title="Değişiklikler">
          <p>
            Bu politika güncellenirse sayfanın en üstündeki tarih değiştirilir. Sitenin işleyişini
            etkileyen önemli bir değişiklik olursa bunu ayrıca belirtiriz.
          </p>
        </Section>

        <Section title="İletişim">
          <p>
            Gizlilikle ilgili soru ve talepleriniz için bize ulaşabilirsiniz:{" "}
            <a
              href="mailto:ucaradem317@gmail.com"
              className="text-violet-300 underline-offset-2 hover:underline"
            >
              ucaradem317@gmail.com
            </a>
          </p>
        </Section>
      </div>
    </div>
  );
}
