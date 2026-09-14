import { useState } from "react";
import { Sparkles, Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, FileText, Info } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

// About Us Component
export function AboutPage() {
  const { lang } = useLanguage();
  return (
    <main className="container-shell py-8 max-w-4xl space-y-6">
      <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 space-y-6">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-black md:text-4xl text-gradient bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            {lang === "te" ? "మా గురించి • VaartaNow" : "About Us • VaartaNow"}
          </h1>
          <p className="text-sm font-bold text-[hsl(var(--muted-foreground))]">
            {lang === "te"
              ? "విశ్లేషణలతో కూడిన ఒక వినూత్న బహుభాషా వార్తా వేదిక."
              : "An innovative multilingual live news platform."}
          </p>
        </div>

        <div className="space-y-4 text-xs font-bold text-[hsl(var(--muted-foreground))] leading-relaxed">
          <p>
            {lang === "te"
              ? "VaartaNow అనేది భారతదేశంలోనే అత్యంత వేగంగా అభివృద్ధి చెందుతున్న బహుభాషా మరియు స్థానిక ఆల్-ఇన్-వన్ వార్తా వేదిక. మా ఏకైక లక్ష్యం నిష్పక్షపాతంగా, ఖచ్చితమైన మరియు లోతైన విశ్లేషణలతో కూడిన వార్తలను మా పాఠకులకు అందించడం. మేము తాజా వార్తలను సేకరించి, అత్యంత నిష్పక్షపాత శైలిలో రీరైట్ చేసి ప్రచురిస్తాము."
              : "VaartaNow is India's fastest-growing multilingual news platform. Our sole mission is to deliver unbiased, accurate, and deeply analyzed updates to our readers."}
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] mt-6 uppercase tracking-wider">
            {lang === "te" ? "🚀 మా లక్ష్యం (Our Mission)" : "🚀 Our Mission"}
          </h3>
          <p>
            {lang === "te"
              ? "స్థానిక సంస్కృతి, రాజకీయాలు, క్రీడలు (క్రికెట్), సాంకేతికత, వ్యాపార రంగాల తాజా సమాచారాన్ని తెలుగు, ఇంగ్లీష్, హిందీ, తమిళం, మరియు కన్నడ భాషల్లో క్షణాల్లో పంపిణీ చేయడం. విశ్వసనీయ సమాచార వనరుగా ఎదగడమే మా అంతిమ లక్ష్యం."
              : "To bridge the regional communication gap by delivering breaking updates on politics, cinema, cricket, technology, and business across 5 Indian languages (Telugu, English, Hindi, Tamil, and Kannada). We strive to remain your ultimate, highly trusted source of digital journalism."}
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] mt-6 uppercase tracking-wider">
            {lang === "te" ? "🔮 మేము అందించే సేవలు (What We Offer)" : "🔮 What We Offer"}
          </h3>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>{lang === "te" ? "బహుభాషా అనువాదం మరియు సులభతర వార్తలు" : "Multilingual news across 5 major languages."}</li>
            <li>{lang === "te" ? "ఆంధ్రప్రదేశ్, తెలంగాణ మరియు విశాఖపట్నం ప్రత్యేక స్థానిక కవరేజ్" : "Hyperlocal coverage for Andhra Pradesh, Telangana, and Vizag corridor."}</li>
            <li>{lang === "te" ? "నిజ సమయ క్రికెట్ లైవ్ స్కోర్లు, పాయింట్ల పట్టికలు & మ్యాచ్ ప్రిడిక్షన్లు" : "Live cricket scoreboards, fixtures, and interactive match prediction polls."}</li>
            <li>{lang === "te" ? "రిమోట్ వర్క్ మరియు ప్రభుత్వ ఉద్యోగాల కోసం ప్రత్యేక జాబ్స్ హబ్" : "A comprehensive Jobs Hub for remote work, internships, and government alerts."}</li>
            <li>{lang === "te" ? "దినసరి ఆధ్యాత్మిక పంచాంగం మరియు వేద జాతక గణనలు" : "Daily Vedic astrology predictions, Panchangam, and instant birth charts."}</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

// Contact Us Component
export function ContactPage() {
  const { lang } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      alert(lang === "te" ? "దయచేసి అన్ని వివరాలను నమోదు చేయండి!" : "Please fill in all required fields!");
      return;
    }
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <main className="container-shell py-8 max-w-4xl space-y-6">
      <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 space-y-6">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-black md:text-4xl text-gradient bg-gradient-to-r from-blue-600 to-indigo-600">
            {lang === "te" ? "మమ్మల్ని సంప్రదించండి" : "Contact Us"}
          </h1>
          <p className="text-sm font-bold text-[hsl(var(--muted-foreground))]">
            {lang === "te"
              ? "ఏదైనా ప్రశ్నలు, సలహాలు లేదా ప్రకటనల భాగస్వామ్యం కోసం సంప్రదించండి."
              : "Get in touch with us for support, feedback, ads, or general queries."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_1.3fr] items-start">
          {/* Quick Business Details */}
          <div className="space-y-4 rounded-2xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--muted))]/20 p-5 font-bold text-xs text-[hsl(var(--muted-foreground))]">
            <h3 className="text-sm font-black text-[hsl(var(--foreground))] uppercase tracking-wider mb-2">Office Information</h3>
            <div className="flex items-center gap-3">
              <Mail className="size-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>contact@vaartanow.in</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-4.5 text-emerald-600 shrink-0" />
              <span>+91 83218 17686</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-4.5 text-red-500 shrink-0" />
              <span>R.K. Beach Road, Visakhapatnam, Andhra Pradesh, India</span>
            </div>
            <div className="border-t border-[hsl(var(--border))]/50 pt-3 mt-2 text-[10px]">
              <span className="font-black text-[hsl(var(--foreground))]">Support Hours:</span> Monday - Saturday (9:00 AM to 6:00 PM IST)
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitted && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-400 animate-pulse">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>
                  {lang === "te" ? "మీ సందేశం విజయవంతంగా పంపబడింది! త్వరలో మిమ్మల్ని సంప్రదిస్తాము." : "Thank you! Your message has been sent successfully."}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[hsl(var(--foreground))] tracking-wider">Name *</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Daggubati"
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--input))] focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[hsl(var(--foreground))] tracking-wider">Email Address *</label>
                <input 
                  type="email" 
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--input))] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-[hsl(var(--foreground))] tracking-wider">Subject</label>
              <input 
                type="text" 
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="AdSense, Jobs, or feedback"
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--input))] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-[hsl(var(--foreground))] tracking-wider">Message *</label>
              <textarea 
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help you today?"
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--input))] focus:outline-none resize-none"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
            >
              <Send className="size-3.5" />
              {lang === "te" ? "సందేశాన్ని పంపు" : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

// Privacy Policy Component (AdSense Specific)
export function PrivacyPage() {
  const { lang } = useLanguage();
  return (
    <main className="container-shell py-8 max-w-4xl space-y-6">
      <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 space-y-6">
        <div className="space-y-2 text-center max-w-2xl mx-auto border-b border-[hsl(var(--border))]/70 pb-4">
          <ShieldCheck className="size-10 text-emerald-600 mx-auto" />
          <h1 className="text-3xl font-black md:text-4xl text-[hsl(var(--foreground))]">
            {lang === "te" ? "గోప్యతా విధానం (Privacy Policy)" : "Privacy Policy"}
          </h1>
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
            AdSense Compliance Certified
          </p>
        </div>

        <div className="space-y-5 text-xs font-bold text-[hsl(var(--muted-foreground))] leading-relaxed">
          <p>
            At **VaartaNow**, accessible from **https://vaartanow.in**, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by VaartaNow and how we use it.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))]/40 pb-1 mt-4">
            1. Consent
          </h3>
          <p>
            By using our website, you hereby consent to our Privacy Policy and agree to its terms.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))]/40 pb-1 mt-4">
            2. Information We Collect
          </h3>
          <p>
            The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information. If you contact us directly via our Contact page, we may receive additional information about you such as your name, email address, phone number, the contents of the message, and any attachments you send us.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))]/40 pb-1 mt-4">
            3. Log Files & Analytics
          </h3>
          <p>
            VaartaNow follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))]/40 pb-1 mt-4">
            4. Cookies and Web Beacons
          </h3>
          <p>
            Like any other website, VaartaNow uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))]/40 pb-1 mt-4">
            5. Google DoubleClick DART Cookie & AdSense Disclosures
          </h3>
          <p>
            Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – **https://policies.google.com/technologies/ads**
          </p>
          <p>
            These third-party ad servers or ad networks use technology in their respective advertisements and links that appear on VaartaNow, which are sent directly to users' browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit. Note that VaartaNow has no access to or control over these cookies that are used by third-party advertisers.
          </p>
        </div>
      </section>
    </main>
  );
}

// Terms & Conditions Component
export function TermsPage() {
  const { lang } = useLanguage();
  return (
    <main className="container-shell py-8 max-w-4xl space-y-6">
      <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 space-y-6">
        <div className="space-y-2 text-center max-w-2xl mx-auto border-b border-[hsl(var(--border))]/70 pb-4">
          <FileText className="size-10 text-blue-600 mx-auto" />
          <h1 className="text-3xl font-black md:text-4xl text-[hsl(var(--foreground))]">
            {lang === "te" ? "నిబంధనలు మరియు షరతులు (Terms & Conditions)" : "Terms and Conditions"}
          </h1>
          <p className="text-sm font-bold text-[hsl(var(--muted-foreground))]">
            Effective Date: May 31, 2026
          </p>
        </div>

        <div className="space-y-5 text-xs font-bold text-[hsl(var(--muted-foreground))] leading-relaxed">
          <p>
            Welcome to **VaartaNow**! These terms and conditions outline the rules and regulations for the use of VaartaNow's Website, located at **https://vaartanow.in**.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))]/40 pb-1 mt-4">
            1. Terms of Use
          </h3>
          <p>
            By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use VaartaNow if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))]/40 pb-1 mt-4">
            2. Intellectual Property & License
          </h3>
          <p>
            Unless otherwise stated, VaartaNow and/or its licensors own the intellectual property rights for all material on VaartaNow. All intellectual property rights are reserved. You may access this from VaartaNow for your own personal use subjected to restrictions set in these terms and conditions.
          </p>
          <p>
            You must not republish material from VaartaNow, sell, rent or sub-license material, or reproduce or duplicate material for commercial gain without explicit written consent.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))]/40 pb-1 mt-4">
            3. Disclaimer & Liability Limitations
          </h3>
          <p>
            To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will limit or exclude our or your liability for death or personal injury, fraud, or any liabilities that cannot be excluded under applicable law.
          </p>
        </div>
      </section>
    </main>
  );
}

// Disclaimer Component
export function DisclaimerPage() {
  const { lang } = useLanguage();
  return (
    <main className="container-shell py-8 max-w-4xl space-y-6">
      <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 space-y-6">
        <div className="space-y-2 text-center max-w-2xl mx-auto border-b border-[hsl(var(--border))]/70 pb-4">
          <Info className="size-10 text-amber-500 mx-auto" />
          <h1 className="text-3xl font-black md:text-4xl text-[hsl(var(--foreground))]">
            {lang === "te" ? "నిరాకరణ ప్రఖ్యాపన (Disclaimer)" : "Disclaimer Notice"}
          </h1>
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
            VaartaNow Legal Notice
          </p>
        </div>

        <div className="space-y-5 text-xs font-bold text-[hsl(var(--muted-foreground))] leading-relaxed">
          <p>
            If you require any more information or have any questions about our site's disclaimer, please feel free to contact us by email at **contact@vaartanow.in**.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))]/40 pb-1 mt-4">
            1. Information Accuracy
          </h3>
          <p>
            All the information on this website - **https://vaartanow.in** - is published in good faith and for general information purpose only. VaartaNow does not make any warranties about the completeness, reliability and accuracy of this information. Any action you take upon the information you find on this website (VaartaNow), is strictly at your own risk. VaartaNow will not be liable for any losses and/or damages in connection with the use of our website.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))]/40 pb-1 mt-4">
            2. Third-Party Links
          </h3>
          <p>
            From our website, you can visit other websites by following hyperlinks to such external sites. While we strive to provide only quality links to useful and ethical websites, we have no control over the content and nature of these sites. These links to other websites do not imply a recommendation for all the content found on these sites. Site owners and content may change without notice and may occur before we have the opportunity to remove a link which may have gone 'bad'.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))]/40 pb-1 mt-4">
            3. Financial and Investment Disclaimer
          </h3>
          <p>
            The content, including share prices, property rates, gold/silver prices, or real estate trends shown on VaartaNow, is compiled dynamically for educational and informational tracking purposes only. None of this information constitutes investment, legal, or professional financial advice. Always consult a certified financial advisor or property surveyor before making major purchasing or investment decisions.
          </p>
        </div>
      </section>
    </main>
  );
}

// 📄 Customer / User Terms (Versioned v1.0)
export function CustomerTermsPage() {
  return (
    <main className="container-shell py-8 max-w-4xl space-y-6 animate-in fade-in duration-300">
      <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 space-y-6">
        <div className="space-y-2 border-b border-[hsl(var(--border))]/70 pb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Document Version: customer_terms_v1_0</span>
          <h1 className="text-2xl sm:text-3xl font-black text-[hsl(var(--foreground))]">
            కస్టమర్ & వినియోగదారు నిబంధనలు (Customer & Seeker Terms)
          </h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            VaartaNow లో స్థానిక సేవలు, విక్రేతలు లేదా వస్తువుల కోసం శోధించే ప్రతి వినియోగదారుడికి ఈ నిబంధనలు వర్తిస్తాయి.
          </p>
        </div>

        <div className="space-y-4 text-xs font-medium text-[hsl(var(--muted-foreground))] leading-relaxed">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-1.5">
            <h4 className="font-black text-sm">ముఖ్య ప్రకటన (Core Discovery Model):</h4>
            <p>
              VaartaNow అనేది స్థానిక స్వతంత్ర ప్రొవైడర్లు మరియు వ్యాపారాల సంప్రదింపు సమాచారాన్ని అందించే డిస్కవరీ ప్లాట్‌ఫారమ్ మాత్రమే. VaartaNow స్వయంగా ఎవరినీ ఉద్యోగిగా నియమించదు, మూడవ పక్షాల పనితనానికి హామీ ఇవ్వదు మరియు నేరుగా లావాదేవీలలో పాల్గొనదు.
            </p>
          </div>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] pt-2">1. ప్రత్యక్ష ధృవీకరణ బాధ్యత (Direct Verification)</h3>
          <p>
            సేవను అంగీకరించే ముందు ప్రొవైడర్ గుర్తింపు, నైపుణ్యం మరియు సేవా ధరను మీరే స్వయంగా నిర్ధారించుకోవాలి.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] pt-2">2. గృహ భద్రత మరియు విలువైన వస్తువులు</h3>
          <p>
            ఇంటి మరమ్మతులు లేదా సేవల నిమిత్తం ప్రొవైడర్లను ఆహ్వానించినప్పుడు విలువైన వస్తువులు, పత్రాలు మరియు ఆభరణాలను సురక్షితంగా ఉంచడం కస్టమర్ బాధ్యత. ఎవరితోనూ బ్యాంకింగ్ OTPలు, ATM పిన్‌లు లేదా వ్యక్తిగత పాస్‌వర్డ్‌లు పంచుకోవద్దు.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] pt-2">3. చెల్లింపులు మరియు వివాదాలు</h3>
          <p>
            పని పూర్తయిన తర్వాత ప్రొవైడర్‌కు చెల్లించే మొత్తానికి మరియు పని నాణ్యతకు సంబంధించిన అన్ని లావాదేవీలు కస్టమర్ మరియు ప్రొవైడర్ మధ్య ప్రత్యక్ష ఒప్పందంపై మాత్రమే ఆధారపడి ఉంటాయి.
          </p>
        </div>
      </section>
    </main>
  );
}

// 📄 Service Provider Terms (Versioned v1.0)
export function ProviderTermsPage() {
  return (
    <main className="container-shell py-8 max-w-4xl space-y-6 animate-in fade-in duration-300">
      <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 space-y-6">
        <div className="space-y-2 border-b border-[hsl(var(--border))]/70 pb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Document Version: provider_terms_v1_0</span>
          <h1 className="text-2xl sm:text-3xl font-black text-[hsl(var(--foreground))]">
            సర్వీస్ ప్రొవైడర్ నిబంధనలు (Service Provider & Business Listing Terms)
          </h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            VaartaNow లో స్వతంత్రంగా తమ సేవలను లేదా యంత్రాలను లిస్ట్ చేసే ప్రొవైడర్లు అంగీకరించాల్సిన చట్టపరమైన నిబంధనలు.
          </p>
        </div>

        <div className="space-y-4 text-xs font-medium text-[hsl(var(--muted-foreground))] leading-relaxed">
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-900 dark:text-teal-200 space-y-1">
            <h4 className="font-black text-sm">స్వతంత్ర కాంట్రాక్టర్ డిక్లరేషన్:</h4>
            <p>
              మీరు VaartaNow లో స్వతంత్ర సేవా ప్రదాతగా నమోదు చేసుకుంటున్నారు. మీరు VaartaNow ఉద్యోగి, ఏజెంట్ లేదా ప్రతినిధి కారు.
            </p>
          </div>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] pt-2">1. సమాచార ఖచ్చితత్వం (Accuracy of Information)</h3>
          <p>
            మీరు అందించే పేరు, మొబైల్ నంబర్, ధరలు, యంత్రాల వివరాలు మరియు అనుభవం నిజమైనవిగా ఉండాలి. నకిలీ గుర్తింపు లేదా మోసపూరిత పోస్టింగ్‌లు తక్షణ ఖాతా రద్దుకు మరియు చట్టపరమైన చర్యలకు దారితీస్తాయి.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] pt-2">2. చట్టపరమైన బాధ్యత మరియు భద్రత</h3>
          <p>
            మీ సేవలు, పరికరాలు, సహాయకులు/కార్మికులు మరియు వర్తించే అన్ని ప్రభుత్వ నిబంధనలకు (లైసెన్సులు, GST మొదలైనవి) మీరే స్వయంగా బాధ్యత వహిస్తారు. కస్టమర్ల ఆస్తికి ఎలాంటి నష్టం కలిగించరాదు.
          </p>

          <h3 className="text-sm font-black text-[hsl(var(--foreground))] pt-2">3. ఖాతా సస్పెన్షన్ మరియు తొలగింపు</h3>
          <p>
            కస్టమర్ల నుండి దొంగతనం, వేధింపులు లేదా మోసంపై విశ్వసనీయ ఫిర్యాదులు వచ్చినప్పుడు, VaartaNow ఎటువంటి ముందస్తు నోటీసు లేకుండా లిస్టింగ్‌ను సస్పెండ్ చేసే పూర్తి హక్కు కలిగి ఉంటుంది.
          </p>
        </div>
      </section>
    </main>
  );
}

// 📄 Service Provider Code of Conduct
export function ProviderCodeOfConductPage() {
  return (
    <main className="container-shell py-8 max-w-4xl space-y-6 animate-in fade-in duration-300">
      <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 space-y-6">
        <div className="space-y-2 border-b border-[hsl(var(--border))]/70 pb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Document Version: code_of_conduct_v1_0</span>
          <h1 className="text-2xl sm:text-3xl font-black text-[hsl(var(--foreground))]">
            ప్రొవైడర్ ప్రవర్తనా నియమావళి (Provider Code of Conduct)
          </h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            ప్రజల విశ్వాసం మరియు కస్టమర్ భద్రత కొరకు ప్రతి ప్రొవైడర్ పాటించవలసిన ప్రాథమిక నియమాలు.
          </p>
        </div>

        <div className="space-y-4 text-xs font-medium text-[hsl(var(--muted-foreground))] leading-relaxed">
          <ul className="space-y-2.5 list-disc list-inside ml-2">
            <li><strong>మర్యాదపూర్వక ప్రవర్తన:</strong> కస్టమర్లు మరియు వారి కుటుంబ సభ్యులతో ఎల్లప్పుడూ గౌరవంగా ప్రవర్తించండి.</li>
            <li><strong>సమయపాలన:</strong> అంగీకరించిన సమయానికి హాజరుకండి; ఆలస్యమైతే ముందుగానే సమాచారం ఇవ్వండి.</li>
            <li><strong>ధరలలో పారదర్శకత:</strong> పని ప్రారంభించే ముందే పూర్తి ఖర్చు మరియు మెటీరియల్ చార్జీలను స్పష్టంగా తెలియజేయండి.</li>
            <li><strong>కస్టమర్ గోప్యత:</strong> కస్టమర్ల ఇళ్లలో చూసిన విషయాలు, పత్రాలు లేదా వ్యక్తిగత సమాచారాన్ని ఇతరులతో పంచుకోవద్దు.</li>
            <li><strong>సున్నా సహనం (Zero Tolerance):</strong> వేధింపులు, మద్యం సేవించి విధులకు హాజరుకావడం, లేదా బెదిరింపులకు పాల్పడితే తక్షణమే శాశ్వత నిషేధం విధించబడుతుంది.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

// 📄 Safety Tips Page
export function SafetyTipsPage() {
  return (
    <main className="container-shell py-8 max-w-4xl space-y-6 animate-in fade-in duration-300">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 md:p-8 text-white space-y-6 shadow-2xl">
        <div className="border-b border-slate-800 pb-4 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center gap-2">
            <ShieldCheck className="size-8 text-amber-400" />
            <span>స్థానిక సేవల భద్రతా సూత్రాలు (Safety First Guidelines)</span>
          </h1>
          <p className="text-xs text-slate-400">
            స్వతంత్ర పనివాళ్లు, డ్రైవర్లు మరియు స్థానిక సేవలను వినియోగించుకునేటప్పుడు మిమ్మల్ని మరియు మీ కుటుంబాన్ని రక్షించుకోండి.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <h3 className="text-sm font-black text-teal-300">🏠 గృహ మరమ్మతులు & పనివాళ్లు</h3>
            <p className="text-slate-300">• పనికి అంగీకరించిన సమయంలో మాత్రమే ఇంట్లోకి అనుమతించండి.</p>
            <p className="text-slate-300">• ముఖ్యమైన డాక్యుమెంట్లు, లాప్టాప్‌లు మరియు విలువైన వస్తువులను కనిపించకుండా భద్రపరచండి.</p>
            <p className="text-slate-300">• ఇంట్లో ఒంటరిగా ఉన్నప్పుడు నమ్మకమైన ఇరుగుపొరుగు వారికి సమాచారం అందించండి.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <h3 className="text-sm font-black text-indigo-300">🚗 రవాణా & డ్రైవింగ్ సేవలు</h3>
            <p className="text-slate-300">• ప్రయాణానికి ముందు డ్రైవర్ పేరు, వాహన నంబర్ మరియు లైసెన్స్ పరిశీలించండి.</p>
            <p className="text-slate-300">• రాత్రి ప్రయాణాల్లో మీ లైవ్ లొకేషన్‌ను కుటుంబ సభ్యులకు వాట్సాప్‌లో షేర్ చేయండి.</p>
            <p className="text-slate-300">• సురక్షిత మరియు గుర్తించబడిన మార్గాల్లో మాత్రమే ప్రయాణించండి.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 space-y-1.5">
          <h4 className="font-black text-red-400">అత్యవసర పరిస్థితుల్లో:</h4>
          <p>ఏదైనా అనుమానాస్పద చర్య, దొంగతనం లేదా భౌతిక ముప్పు ఏర్పడితే ఆలస్యం చేయకుండా జాతీయ అత్యవసర నంబర్ <strong>112</strong> కు లేదా స్థానిక పోలీసులకు కాల్ చేయండి.</p>
        </div>
      </section>
    </main>
  );
}

// 📄 Grievance Redressal Officer (India IT Rules Compliance)
export function GrievancePage() {
  return (
    <main className="container-shell py-8 max-w-4xl space-y-6 animate-in fade-in duration-300">
      <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 space-y-6">
        <div className="space-y-2 border-b border-[hsl(var(--border))]/70 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-[hsl(var(--foreground))]">
            ఫిర్యాదుల పరిష్కార అధికారి (Grievance Redressal Officer)
          </h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            భారత ప్రభుత్వ సమాచార సాంకేతిక (మధ్యవర్తి మార్గదర్శకాలు & డిజిటల్ మీడియా ఎథిక్స్ కోడ్) నియమాలు, 2021 ప్రకారం.
          </p>
        </div>

        <div className="space-y-4 text-xs font-bold text-[hsl(var(--muted-foreground))] leading-relaxed">
          <p>
            VaartaNow ప్లాట్‌ఫారమ్‌లో ప్రచురించబడిన ఏదైనా సమాచారం, ప్రకటన లేదా సేవా జాబితాపై మీకు అభ్యంతరాలు లేదా చట్టపరమైన ఫిర్యాదులు ఉంటే మా నియమిత గ్రీవెన్స్ అధికారికి లిఖితపూర్వకంగా తెలియజేయవచ్చు.
          </p>

          <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 space-y-2">
            <h3 className="text-sm font-black text-[hsl(var(--foreground))]">Grievance Officer Details:</h3>
            <p><strong>పేరు (Name):</strong> ఎన్. శ్రీనివాసరావు (N. Srinivasa Rao)</p>
            <p><strong>హోదా (Designation):</strong> Grievance Redressal Officer & Trust Lead</p>
            <p><strong>ఈమెయిల్ (Email):</strong> grievance@vaartanow.in</p>
            <p><strong>చిరునామా (Address):</strong> VaartaNow Media Networks, R.K. Beach Road, Visakhapatnam, Andhra Pradesh 530002, India.</p>
            <p><strong>స్పందన సమయం (Response Time):</strong> ఫిర్యాదు అందిన 24 గంటల్లో రసీదు మరియు 15 రోజుల్లో పూర్తి పరిష్కారం అందించబడుతుంది.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
