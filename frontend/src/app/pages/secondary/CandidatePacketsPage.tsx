import {
  CheckCircle2,
  FileDown,
  FileSignature,
  MapPin,
  Phone,
  Send,
  UserCircle2,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../../components/ui-system/Button';
import { FilterBar } from '../../components/ui-system/FilterBar';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import {
  buildCandidatePacketPdfContent,
  candidatePackets as initialCandidatePackets,
  type CandidatePacket,
} from '../../content/studentOperations';
import { InfoLine, MetricCard, MetricGrid, PageSection, Panel } from './secondaryShared';

const categoryOptions = ['A', 'B', 'C', 'D'];
const locationOptions = ['София - Младост', 'София - Център', 'Пловдив - Тракия', 'Павел Баня'];

function toPdfTemplate(category: string, location: string) {
  return `mindonroad-category-${category.toLowerCase()}-${location
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, '-')}.pdf`;
}

function downloadPacketPdf(packet: CandidatePacket) {
  const blob = new Blob([buildCandidatePacketPdfContent(packet)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = packet.pdfTemplate;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function CandidatePacketsPage() {
  const [packets, setPackets] = useState<CandidatePacket[]>(initialCandidatePackets);
  const [searchValue, setSearchValue] = useState('');
  const [selectedPacketId, setSelectedPacketId] = useState(initialCandidatePackets[0]?.id ?? '');

  const filteredPackets = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return packets;

    return packets.filter((packet) =>
      [packet.candidateName, packet.phone, packet.category, packet.location, packet.pdfTemplate].some((field) =>
        field.toLowerCase().includes(query),
      ),
    );
  }, [packets, searchValue]);

  const selectedPacket = useMemo(
    () => packets.find((packet) => packet.id === selectedPacketId) ?? packets[0] ?? null,
    [packets, selectedPacketId],
  );

  const readyPackets = packets.filter((packet) => packet.status === 'ready').length;
  const sentPackets = packets.filter((packet) => packet.status === 'sent').length;

  const updatePacket = (packetId: string, updates: Partial<CandidatePacket>) => {
    setPackets((current) =>
      current.map((packet) =>
        packet.id === packetId
          ? {
              ...packet,
              ...updates,
              pdfTemplate: toPdfTemplate(updates.category ?? packet.category, updates.location ?? packet.location),
              status: updates.status ?? 'ready',
            }
          : packet,
      ),
    );
  };

  const handleSendPacket = () => {
    if (!selectedPacket) return;

    const nextPacket = {
      ...selectedPacket,
      status: 'sent' as const,
      sentAt: new Date().toLocaleString('bg-BG'),
    };

    downloadPacketPdf(nextPacket);
    updatePacket(selectedPacket.id, nextPacket);
  };

  return (
    <div>
      <PageHeader
        title="Кандидати"
        description="По-чист operational екран: избираш кандидат, задаваш категория и локация, виждаш PDF пакета и го изпращаш."
        breadcrumbs={[{ label: 'Начало' }, { label: 'Кандидати' }]}
        actions={
          <Button variant="primary" icon={<Send size={18} />} onClick={handleSendPacket}>
            Изпрати PDF пакет
          </Button>
        }
      />

      <FilterBar
        searchPlaceholder="Търсене по име, телефон, категория или локация..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showFilterButton={false}
      />

      <PageSection>
        <MetricGrid>
          <MetricCard icon={<Users size={18} />} label="Кандидати" value={String(packets.length)} detail="Всички активни запитвания" tone="info" />
          <MetricCard icon={<FileDown size={18} />} label="Готови пакети" value={String(readyPackets)} detail="Очакват изпращане" tone={readyPackets > 0 ? 'warning' : 'success'} />
          <MetricCard icon={<CheckCircle2 size={18} />} label="Изпратени" value={String(sentPackets)} detail="С лог на последно изпращане" tone="success" />
          <MetricCard icon={<MapPin size={18} />} label="Локации" value={String(new Set(packets.map((packet) => packet.location)).size)} detail="По офис и град" tone="neutral" />
        </MetricGrid>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <Panel title="Списък кандидати" subtitle="Избери кандидат отляво, а вдясно настрой категория/локация и изпрати правилния PDF пакет.">
            <div className="space-y-4">
              {filteredPackets.map((packet) => {
                const isActive = packet.id === selectedPacket?.id;

                return (
                  <button
                    key={packet.id}
                    type="button"
                    onClick={() => setSelectedPacketId(packet.id)}
                    className="w-full rounded-[28px] p-4 text-left transition-all hover:-translate-y-0.5"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(25, 37, 64, 0.96))'
                        : 'var(--bg-card-elevated)',
                      border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--ghost-border)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl"
                          style={{
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: 'var(--primary-accent)',
                          }}
                        >
                          <UserCircle2 size={24} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {packet.candidateName}
                          </h3>
                          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {packet.phone}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={packet.status === 'sent' ? 'success' : 'warning'}>
                        {packet.status === 'sent' ? 'Изпратен' : 'Готов'}
                      </StatusBadge>
                    </div>

                    <div
                      className="mt-4 grid gap-3 rounded-3xl p-4"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      <InfoLine label="Категория" value={`Кат. ${packet.category}`} />
                      <InfoLine label="Локация" value={packet.location} />
                      <InfoLine label="Последно изпращане" value={packet.sentAt} />
                    </div>
                  </button>
                );
              })}

              {!filteredPackets.length && (
                <div
                  className="rounded-3xl p-6 text-sm"
                  style={{
                    background: 'var(--bg-card-elevated)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--ghost-border)',
                  }}
                >
                  Няма кандидати по текущото търсене.
                </div>
              )}
            </div>
          </Panel>

          <Panel title="PDF пакет за изпращане" subtitle="Дясната зона е работният preview: настройваш категория и локация, виждаш шаблона и изпращаш без да ровиш в таблица.">
            {selectedPacket && (
              <div className="space-y-6">
                <div
                  className="rounded-[28px] p-6"
                  style={{
                    background: 'linear-gradient(180deg, rgba(18, 27, 50, 0.96), rgba(14, 22, 42, 0.98))',
                    border: '1px solid var(--ghost-border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{
                          background: 'rgba(167, 139, 250, 0.12)',
                          color: 'var(--ai-accent)',
                        }}
                      >
                        <FileSignature size={28} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--text-tertiary)' }}>
                          Кандидатски пакет
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {selectedPacket.candidateName}
                        </h2>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <span className="inline-flex items-center gap-2">
                            <Phone size={14} />
                            {selectedPacket.phone}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <MapPin size={14} />
                            {selectedPacket.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={selectedPacket.status === 'sent' ? 'success' : 'warning'}>
                      {selectedPacket.status === 'sent' ? 'Изпратен' : 'Готов за изпращане'}
                    </StatusBadge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>
                      Категория
                    </label>
                    <select
                      value={selectedPacket.category}
                      onChange={(event) => updatePacket(selectedPacket.id, { category: event.target.value })}
                      className="h-12 w-full rounded-2xl px-4 text-sm outline-none"
                      style={{
                        background: 'var(--bg-card-elevated)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--ghost-border)',
                      }}
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          Категория {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>
                      Локация
                    </label>
                    <select
                      value={selectedPacket.location}
                      onChange={(event) => updatePacket(selectedPacket.id, { location: event.target.value })}
                      className="h-12 w-full rounded-2xl px-4 text-sm outline-none"
                      style={{
                        background: 'var(--bg-card-elevated)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--ghost-border)',
                      }}
                    >
                      {locationOptions.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div
                  className="rounded-[28px] p-6"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--ghost-border)',
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--text-tertiary)' }}>
                        PDF шаблон
                      </p>
                      <p className="mt-2 break-all text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {selectedPacket.pdfTemplate}
                      </p>
                    </div>
                    <div
                      className="rounded-2xl px-4 py-3 text-sm font-semibold"
                      style={{
                        background: 'rgba(59, 130, 246, 0.08)',
                        color: 'var(--primary-accent)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                      }}
                    >
                      {selectedPacket.category}
                    </div>
                  </div>

                  <div
                    className="mt-5 rounded-3xl p-5 text-sm leading-7"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(25, 37, 64, 0.92))',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {buildCandidatePacketPdfContent(selectedPacket)
                      .split('\n')
                      .map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" icon={<Send size={18} />} onClick={handleSendPacket}>
                    {selectedPacket.status === 'sent' ? 'Изпрати отново PDF' : 'Изпрати PDF пакет'}
                  </Button>
                  <Button variant="secondary" icon={<FileDown size={18} />} onClick={() => downloadPacketPdf(selectedPacket)}>
                    Само изтегли PDF
                  </Button>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </PageSection>
    </div>
  );
}
