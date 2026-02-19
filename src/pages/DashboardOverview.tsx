import { useEffect, useState } from 'react';
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';
import type { Dozenten, Teilnehmer, Raeume, Kurse, Anmeldungen } from '@/types/app';
import { GraduationCap, Users, DoorOpen, BookOpen, ClipboardList, TrendingUp, Euro, CalendarDays } from 'lucide-react';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Stats {
  dozenten: Dozenten[];
  teilnehmer: Teilnehmer[];
  raeume: Raeume[];
  kurse: Kurse[];
  anmeldungen: Anmeldungen[];
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      LivingAppsService.getDozenten(),
      LivingAppsService.getTeilnehmer(),
      LivingAppsService.getRaeume(),
      LivingAppsService.getKurse(),
      LivingAppsService.getAnmeldungen(),
    ]).then(([dozenten, teilnehmer, raeume, kurse, anmeldungen]) => {
      setStats({ dozenten, teilnehmer, raeume, kurse, anmeldungen });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const today = new Date();

  const aktivKurse = stats?.kurse.filter(k =>
    k.fields.startdatum && k.fields.enddatum &&
    !isAfter(parseISO(k.fields.startdatum), today) &&
    !isBefore(parseISO(k.fields.enddatum), today)
  ) ?? [];

  const kommendeKurse = stats?.kurse.filter(k =>
    k.fields.startdatum && isAfter(parseISO(k.fields.startdatum), today)
  ).sort((a, b) =>
    parseISO(a.fields.startdatum!).getTime() - parseISO(b.fields.startdatum!).getTime()
  ).slice(0, 5) ?? [];

  const bezahltCount = stats?.anmeldungen.filter(a => a.fields.bezahlt).length ?? 0;
  const offenCount = (stats?.anmeldungen.length ?? 0) - bezahltCount;

  const gesamtUmsatz = stats?.anmeldungen.reduce((sum, a) => {
    if (!a.fields.bezahlt || !a.fields.kurs) return sum;
    const kursId = extractRecordId(a.fields.kurs);
    const kurs = stats.kurse.find(k => k.record_id === kursId);
    return sum + (kurs?.fields.preis ?? 0);
  }, 0) ?? 0;

  const anmeldungenPerKurs = stats?.kurse.map(k => ({
    name: (k.fields.titel ?? 'Unbekannt').slice(0, 16),
    count: stats.anmeldungen.filter(a => extractRecordId(a.fields.kurs) === k.record_id).length,
  })).filter(d => d.count > 0).sort((a, b) => b.count - a.count).slice(0, 6) ?? [];

  const kpiData = [
    { label: 'Dozenten', value: stats?.dozenten.length ?? 0, icon: GraduationCap, color: 'oklch(0.42 0.18 264)', bg: 'oklch(0.92 0.03 264)' },
    { label: 'Teilnehmer', value: stats?.teilnehmer.length ?? 0, icon: Users, color: 'oklch(0.52 0.18 200)', bg: 'oklch(0.92 0.03 200)' },
    { label: 'Räume', value: stats?.raeume.length ?? 0, icon: DoorOpen, color: 'oklch(0.55 0.18 150)', bg: 'oklch(0.92 0.03 150)' },
    { label: 'Kurse gesamt', value: stats?.kurse.length ?? 0, icon: BookOpen, color: 'oklch(0.58 0.18 50)', bg: 'oklch(0.92 0.03 50)' },
    { label: 'Anmeldungen', value: stats?.anmeldungen.length ?? 0, icon: ClipboardList, color: 'oklch(0.55 0.2 310)', bg: 'oklch(0.92 0.03 310)' },
  ];

  return (
    <div className="space-y-8">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-8 shadow-elevated">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(-20%, 30%)' }} />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: 'oklch(0.85 0.08 264)' }}>
              Kursverwaltungssystem
            </p>
            <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: 'oklch(0.98 0 0)' }}>
              Willkommen zurück
            </h1>
            <p className="text-base font-light" style={{ color: 'oklch(0.85 0.04 264)' }}>
              {loading ? 'Daten werden geladen…' : `${aktivKurse.length} aktive Kurse · ${kommendeKurse.length} kommende Kurse`}
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="rounded-xl px-5 py-4" style={{ background: 'oklch(1 0 0 / 12%)' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} style={{ color: 'oklch(0.85 0.08 264)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'oklch(0.85 0.08 264)' }}>Aktive Kurse</span>
              </div>
              <div className="text-3xl font-bold stat-value" style={{ color: 'oklch(0.98 0 0)' }}>{loading ? '…' : aktivKurse.length}</div>
            </div>
            <div className="rounded-xl px-5 py-4" style={{ background: 'oklch(1 0 0 / 12%)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Euro size={14} style={{ color: 'oklch(0.85 0.08 264)' }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'oklch(0.85 0.08 264)' }}>Umsatz bezahlt</span>
              </div>
              <div className="text-3xl font-bold stat-value" style={{ color: 'oklch(0.98 0 0)' }}>
                {loading ? '…' : `${gesamtUmsatz.toLocaleString('de-DE')} €`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiData.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl p-5 shadow-card" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <div className="text-3xl font-bold stat-value" style={{ color: 'var(--foreground)' }}>
              {loading ? '—' : value}
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UPCOMING COURSES */}
        <div className="rounded-xl p-6 shadow-card" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Kommende Kurse</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Nächste geplante Veranstaltungen</p>
            </div>
            <CalendarDays size={16} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'var(--muted)' }} />)}
            </div>
          ) : kommendeKurse.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <BookOpen size={28} style={{ color: 'var(--muted-foreground)' }} />
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Keine kommenden Kurse</p>
            </div>
          ) : (
            <div className="space-y-2">
              {kommendeKurse.map((kurs, i) => {
                const anmCount = stats?.anmeldungen.filter(a => extractRecordId(a.fields.kurs) === kurs.record_id).length ?? 0;
                const dozentId = extractRecordId(kurs.fields.dozent);
                const dozent = stats?.dozenten.find(d => d.record_id === dozentId);
                return (
                  <div key={kurs.record_id} className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: 'var(--muted)' }}>
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold stat-value flex-shrink-0" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{kurs.fields.titel ?? '—'}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        {kurs.fields.startdatum ? format(parseISO(kurs.fields.startdatum), 'dd. MMM yyyy', { locale: de }) : '—'}
                        {dozent ? ` · ${dozent.fields.name}` : ''}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-xs font-semibold stat-value px-2 py-0.5 rounded-full" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                        {anmCount} TN
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Chart */}
          <div className="rounded-xl p-6 shadow-card" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="mb-4">
              <h2 className="text-base font-semibold tracking-tight">Anmeldungen pro Kurs</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Top-Kurse nach Teilnehmerzahl</p>
            </div>
            {loading ? (
              <div className="h-36 rounded-lg animate-pulse" style={{ background: 'var(--muted)' }} />
            ) : anmeldungenPerKurs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-36 gap-2">
                <ClipboardList size={24} style={{ color: 'var(--muted-foreground)' }} />
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Noch keine Anmeldungen</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={anmeldungenPerKurs} barSize={22}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'oklch(0.52 0.03 260)' }} axisLine={false} tickLine={false} />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }}
                    cursor={{ fill: 'oklch(0.42 0.18 264 / 0.06)' }}
                  />
                  <Bar dataKey="count" name="Anmeldungen" radius={[4, 4, 0, 0]}>
                    {anmeldungenPerKurs.map((_, idx) => (
                      <Cell key={idx} fill={idx === 0 ? 'oklch(0.42 0.18 264)' : 'oklch(0.65 0.1 264)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Payment Status */}
          <div className="rounded-xl p-6 shadow-card" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="text-base font-semibold tracking-tight mb-4">Zahlungsstatus</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-4" style={{ background: 'oklch(0.94 0.05 150)' }}>
                <div className="text-2xl font-bold stat-value mb-0.5" style={{ color: 'oklch(0.35 0.15 150)' }}>
                  {loading ? '—' : bezahltCount}
                </div>
                <div className="text-xs font-medium" style={{ color: 'oklch(0.45 0.1 150)' }}>Bezahlt</div>
              </div>
              <div className="rounded-lg p-4" style={{ background: 'oklch(0.94 0.05 50)' }}>
                <div className="text-2xl font-bold stat-value mb-0.5" style={{ color: 'oklch(0.45 0.15 50)' }}>
                  {loading ? '—' : offenCount}
                </div>
                <div className="text-xs font-medium" style={{ color: 'oklch(0.5 0.1 50)' }}>Offen</div>
              </div>
            </div>
            {!loading && stats && stats.anmeldungen.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  <span>Zahlungsquote</span>
                  <span className="font-semibold stat-value">{Math.round((bezahltCount / stats.anmeldungen.length) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.round((bezahltCount / stats.anmeldungen.length) * 100)}%`,
                      background: 'oklch(0.55 0.18 150)'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
