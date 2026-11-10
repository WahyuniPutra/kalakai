"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, CalendarDays, Check, Compass, Eye, Heart, MapPin, RotateCcw, Send, Sparkles } from "lucide-react";
import { invitationTemplates, type InvitationTemplate } from "@/lib/invitation-templates";
import styles from "./InvitationStudio.module.css";

const [classic] = invitationTemplates;
const steps = [
  { title: "Pilih desain", description: "Coba beberapa palet. Warna dan gaya huruf di pratinjau akan langsung berubah." },
  { title: "Isi detail", description: "Ubah nama dan lokasi contoh untuk melihat bagaimana undangan Anda mulai terbentuk." },
  { title: "Coba RSVP", description: "Berperan sebagai tamu. Pilih jawaban yang ingin Anda kirim." },
  { title: "Siap dibagikan", description: "Di editor, simpan draf terlebih dahulu. Setelah undangan diterbitkan, salin tautan personal dan kirim ke tamu." },
] as const;
const sample = { names: "Alya & Bima", venue: "Palangka Raya" };

function SampleCover({ template, names, venue, compact = false }: { template: InvitationTemplate; names: string; venue: string; compact?: boolean }) {
  return (
    <div
      className={styles.cover}
      data-template={template.id}
      data-font={template.font}
      data-compact={compact || undefined}
      style={{ "--theme-color": template.color, "--theme-accent": template.accent } as CSSProperties}
      aria-hidden="true"
    >
      <div className={styles.coverFrame}>
        <span className={styles.coverKicker}>UNDANGAN PERNIKAHAN</span>
        <Heart className={styles.coverMark} size={19} />
        <strong>{names || sample.names}</strong>
        <div className={styles.coverDetails}>
          <span><CalendarDays size={13} />Minggu, 20 Juni 2027</span>
          <span><MapPin size={13} />{venue || sample.venue}</span>
        </div>
      </div>
    </div>
  );
}

export default function InvitationStudio() {
  const [template, setTemplate] = useState<InvitationTemplate>(classic);
  const [step, setStep] = useState(0);
  const [names, setNames] = useState(sample.names);
  const [venue, setVenue] = useState(sample.venue);
  const [reply, setReply] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const tourHeading = useRef<HTMLHeadingElement>(null);
  const currentStep = steps[step];

  function goToStep(next: number) {
    setStep(next);
    tourHeading.current?.focus();
  }

  function restart() {
    setTemplate(classic);
    setNames(sample.names);
    setVenue(sample.venue);
    setReply("");
    setConfirmed(false);
    goToStep(0);
  }

  return (
    <div className={styles.studio}>
      <section id="template" className={styles.gallery} aria-labelledby="template-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}><Sparkles size={15} /> GALERI TEMPLATE</p>
            <h2 id="template-title">Mulai dari gaya <em>yang Anda suka.</em></h2>
          </div>
          <p>Pilih palet dan tipografi, atau mulai dengan kanvas kosong. Detail acara dan bagian undangan bisa Anda atur di editor.</p>
        </div>
        <div className={styles.galleryGrid}>
          {invitationTemplates.map((item) => (
            <article className={styles.templateCard} key={item.id}>
              <SampleCover template={item} names={sample.names} venue={sample.venue} compact />
              <div className={styles.cardContent}>
                <h3>{item.name}</h3>
                <p>{item.detail}</p>
                <div className={styles.cardActions}>
                  <Link href={`/register?template=${item.id}`} aria-label={`Pakai template ${item.name}`}>Pakai <ArrowUpRight size={15} /></Link>
                  <a href="#jelajah" aria-label={`Coba template ${item.name} di Mode Jelajah`} onClick={() => { setTemplate(item); setStep(0); }}>
                    <Eye size={15} /> Coba
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="jelajah" className={styles.tour} aria-labelledby="jelajah-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}><Compass size={16} /> MODE JELAJAH</p>
            <h2 id="jelajah-title">Coba dulu, <em>baru mulai.</em></h2>
          </div>
          <p>Ikuti empat langkah untuk melihat cara kerja Kalakai. Simulasi ini bisa dicoba tanpa akun dan tidak menyimpan data.</p>
        </div>
        <ol className={styles.stepNav} aria-label="Langkah Mode Jelajah">
          {steps.map(({ title }, index) => (
            <li key={title}>
              <button type="button" aria-current={step === index ? "step" : undefined} onClick={() => goToStep(index)}>
                <span>{index + 1}</span>{title}
              </button>
            </li>
          ))}
        </ol>
        <div className={styles.tourGrid}>
          <div className={styles.controls}>
            <p className={styles.progress}>LANGKAH {step + 1} / {steps.length}</p>
            <h3 ref={tourHeading} tabIndex={-1}>{currentStep.title}</h3>
            <p>{currentStep.description}</p>
            {step === 0 && (
              <div className={styles.options} aria-label="Gaya undangan" role="group">
                {invitationTemplates.map((item) => (
                  <button key={item.id} type="button" aria-pressed={item.id === template.id} onClick={() => setTemplate(item)}>
                    <span style={{ background: item.color }} />{item.name}
                  </button>
                ))}
              </div>
            )}
            {step === 1 && (
              <div className={styles.fields}>
                <label>Nama pada undangan<input value={names} onChange={(event) => setNames(event.target.value)} maxLength={45} placeholder={sample.names} /></label>
                <label>Lokasi acara<input value={venue} onChange={(event) => setVenue(event.target.value)} maxLength={70} placeholder={sample.venue} /></label>
              </div>
            )}
            {step === 2 && (
              <form className={styles.fields} onSubmit={(event) => { event.preventDefault(); setConfirmed(true); }}>
                <fieldset className={styles.rsvp}>
                  <legend>Apakah Anda akan hadir?</legend>
                  {["Hadir", "Berhalangan"].map((answer) => (
                    <label key={answer}>
                      <input name="jelajah-rsvp" type="radio" value={answer} checked={reply === answer} required
                        onChange={() => { setReply(answer); setConfirmed(false); }} />
                      {answer}
                    </label>
                  ))}
                </fieldset>
                <button className={styles.secondary} type="submit"><Send size={15} /> Kirim simulasi</button>
                <div role="status">
                  {confirmed && <p className={styles.feedback}><Check size={16} /> Jawaban contoh: {reply}.</p>}
                </div>
              </form>
            )}
            {step === 3 && (
              <div className={styles.finish}>
                <Link className={styles.primary} href={`/register?template=${template.id}`}>Buat undangan dengan gaya ini <ArrowRight size={16} /></Link>
                <small>Kalakai membawa pilihan template ke editor. Isi simulasi hanya contoh.</small>
              </div>
            )}
            <div className={styles.tourActions}>
              {step > 0 && <button type="button" className={styles.secondary} onClick={() => goToStep(step - 1)}><ArrowLeft size={15} /> Kembali</button>}
              {step < steps.length - 1
                ? <button type="button" className={styles.primary} onClick={() => goToStep(step + 1)}>Lanjut <ArrowRight size={16} /></button>
                : <button type="button" className={styles.secondary} onClick={restart}><RotateCcw size={15} /> Ulangi simulasi</button>}
            </div>
          </div>
          <div className={styles.stage}>
            <div className={styles.stageLabel}><span /> PRATINJAU SIMULASI <span /></div>
            <figure aria-label={`Contoh template ${template.name} untuk ${names || sample.names} di ${venue || sample.venue}`}>
              <SampleCover template={template} names={names} venue={venue} />
            </figure>
            <Link className={styles.demoLink} href="/romeo-juliet/budi-santoso">Buka contoh undangan lengkap <ArrowUpRight size={15} /></Link>
          </div>
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="studio-faq">
        <div>
          <p className={styles.kicker}><Heart size={15} /> SEBELUM MULAI</p>
          <h2 id="studio-faq">Sering ditanyakan.</h2>
          <a href="#template">Kembali ke galeri <ArrowUp size={15} /></a>
        </div>
        <div className={styles.questions}>
          <details><summary>Apakah harus punya akun?</summary><p>Galeri, contoh undangan, dan Mode Jelajah bisa dibuka tanpa akun. Masuk atau daftar untuk menyimpan draf dan menerbitkan undangan Anda sendiri.</p></details>
          <details><summary>Bisakah mengganti desain setelah mengisi acara?</summary><p>Bisa. Pilih template lain di editor untuk mengganti palet dan tipografi. Nama, tanggal, lokasi, dan pengaturan bagian tetap tersimpan.</p></details>
          <details><summary>Bagaimana cara membuat tautan untuk satu tamu?</summary><p>Terbitkan undangan, isi nama tamu pada pratinjau di editor, lalu tekan Salin tautan personal. Bagikan tautan tersebut kepada tamu yang dituju.</p></details>
        </div>
      </section>
    </div>
  );
}
