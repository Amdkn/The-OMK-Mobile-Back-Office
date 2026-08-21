import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  HeartHandshake, 
  Calendar, 
  Award, 
  ChevronRight, 
  Bot, 
  FileText, 
  Mail,
  ShieldCheck,
  Coffee,
  CheckCircle2,
  Phone,
  Briefcase,
  Sparkles,
  ArrowRight,
  Clock,
  Send
} from 'lucide-react';
import DetailSection, { DetailCard, AIInsightCard } from '../layout/DetailSection';
import { AppTopNav } from '../layout/AppTabBar';
import DetailDrawer from '../layout/DetailDrawer';

interface Employee {
  id: string;
  name: string;
  role: string;
  dept: string;
  status: 'Actif' | 'En congé' | 'Onboarding';
  start: string;
  email: string;
  phone: string;
  salary: string;
  skills: string[];
  bio: string;
  lastReview: string;
}

const INITIAL_EMPLOYEES: Employee[] = [
  { 
    id: 'e1', 
    name: 'Alexandre Meyer', 
    role: 'Staff Engineer (Rust & Distributed Systems)', 
    dept: 'Engineering', 
    status: 'Actif', 
    start: 'Fév 2026', 
    email: 'alex@omk.corp',
    phone: '+33 6 11 22 33 44',
    salary: '$9,500/m',
    skills: ['Rust', 'WebAssembly', 'Distributed Consensus', 'gRPC'],
    bio: 'Lead architect sur le moteur de runtime et l\'isolation des bacs à sable.',
    lastReview: 'Note 4.9/5 • Performance exceptionnelle'
  },
  { 
    id: 'e2', 
    name: 'Sophie Laurent', 
    role: 'Lead Growth & Enterprise Expansion', 
    dept: 'Marketing & Sales', 
    status: 'Actif', 
    start: 'Mar 2026', 
    email: 'sophie@omk.corp',
    phone: '+33 6 55 66 77 88',
    salary: '$8,200/m',
    skills: ['Go-to-Market', 'Inbound AI', 'Enterprise Sales', 'HubSpot'],
    bio: 'Responsable de l\'acquisition B2B et des partenariats stratégiques.',
    lastReview: 'Note 4.8/5 • Objectifs Q2 dépassés de 18%'
  },
  { 
    id: 'e3', 
    name: 'Marc Dupont', 
    role: 'Lead Product & System Designer', 
    dept: 'Design', 
    status: 'Actif', 
    start: 'Jan 2026', 
    email: 'marc@omk.corp',
    phone: '+33 6 99 88 77 66',
    salary: '$7,800/m',
    skills: ['Figma', 'Design Systems', 'Tailwind', 'Motion UI'],
    bio: 'Créateur du design system OMK, garant de la typographie et des animations fluides.',
    lastReview: 'Note 5.0/5 • Score CSAT design record'
  },
];

const LEAVES = [
  { id: 'l1', employee: 'Sophie Laurent', type: 'Congés Payés', dates: '12 - 19 Août', status: 'Approuvé', days: 5 },
  { id: 'l2', employee: 'Alexandre Meyer', type: 'Conférence RustConf', dates: '02 - 04 Sept', status: 'En attente', days: 3 },
];

const REVIEWS = [
  { id: 'r1', cycle: 'Q3 2026 360° Review', target: 'Tous les collaborateurs', status: 'En cours (75%)', deadline: '30 Sept' },
  { id: 'r2', cycle: 'Q2 2026 Performance', target: 'Direction & Leads', status: 'Clôturé', deadline: '30 Juin' },
];

const PERKS = [
  { id: 'p1', title: 'Mutuelle Alan Green 100% Prise en Charge', cat: 'Santé & Prévoyance', val: 'Couverture Premium' },
  { id: 'p2', title: 'Budget Matériel & Télétravail ($2,500/an)', cat: 'Équipement', val: 'MacBook Pro M3 Max' },
  { id: 'p3', title: 'Abonnement Gym & Bien-être ClassPass', cat: 'Bien-être', val: 'Illimité' }
];

const HR_TABS = [
  { id: 'team', label: 'Équipe', icon: Users, badge: 3 },
  { id: 'leaves', label: 'Congés', icon: Calendar, badge: 2 },
  { id: 'reviews', label: 'Évaluations', icon: Award },
  { id: 'perks', label: 'Avantages', icon: Coffee }
];

export default function HR() {
  const [activeTab, setActiveTab] = useState('team');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent text-slate-100 theme-transition overflow-hidden">
      {/* Top Multipage Segmented Menu */}
      <AppTopNav 
        tabs={HR_TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: TEAM */}
          {activeTab === 'team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Capital Humain & Équipe"
                subtitle="Effectifs OMK et fiches collaborateurs"
                badge={`${employees.length} Membres`}
                icon={Users}
                kpis={[
                  { label: 'Taux Rétention', value: '100%', sub: '0 turnover' },
                  { label: 'eNPS Score', value: '+84', sub: 'Excellente cohésion', trend: 'up' },
                  { label: 'Masse Salariale', value: '$25.5k', sub: 'Mensuel' }
                ]}
              >
                <div className="space-y-3">
                  {employees.map(emp => (
                    <DetailCard
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      isInteractive
                      title={emp.name}
                      badge={emp.dept}
                      badgeColor="bg-slate-950 text-slate-300 border-slate-800"
                      icon={Users}
                      subtitle={`${emp.role} • Depuis ${emp.start}`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400 font-mono">{emp.email}</span>
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span>{emp.status}</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </DetailCard>
                  ))}
                </div>

                <AIInsightCard
                  title="Gestion Prédictive des Talents"
                  content="Les compétences en Rust et Architecture Distribuée sont en sur-demande. Recommandation : proposer une prime de rétention semestrielle pour Alexandre Meyer."
                  actionLabel="Planifier un point 1-on-1 carrière"
                  onAction={() => showToast('Invitation pour 1-on-1 envoyée')}
                />
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 2: LEAVES */}
          {activeTab === 'leaves' && (
            <motion.div
              key="leaves"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Demandes de Congés & Absences"
                subtitle="Validation des plannings et continuité opérationnelle"
                icon={Calendar}
                badge="1 En attente"
                badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/30"
                kpis={[
                  { label: 'Solde Moyen', value: '18 jours', sub: 'Par collaborateur' },
                  { label: 'Taux Approbation', value: '100%', sub: 'Traitement < 24h', trend: 'up' },
                  { label: 'Absences Actuelles', value: '0', sub: '100% présents' }
                ]}
              >
                <div className="space-y-3">
                  {LEAVES.map(l => (
                    <DetailCard
                      key={l.id}
                      title={l.employee}
                      badge={l.status}
                      badgeColor={l.status === 'Approuvé' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
                      icon={Calendar}
                      subtitle={`${l.type} • ${l.dates} (${l.days} jours)`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400">Impact planning : <strong className="text-emerald-400">Couverture assurée</strong></span>
                        {l.status !== 'Approuvé' && (
                          <button 
                            onClick={() => showToast(`Demande de congé pour ${l.employee} approuvée`)}
                            className="text-emerald-400 font-semibold hover:underline"
                          >
                            Approuver la demande →
                          </button>
                        )}
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Campagnes d'Évaluation & Feedback"
                subtitle="Revues 360° et fixation des objectifs trimestriels"
                icon={Award}
                badge="Q3 en cours"
                kpis={[
                  { label: 'Taux Participation', value: '75%', sub: 'En progression', trend: 'up' },
                  { label: 'Note Moyenne', value: '4.9/5', sub: 'Excellence' },
                  { label: 'Date Clôture', value: '30 Sept', sub: 'J-40' }
                ]}
              >
                <div className="space-y-3">
                  {REVIEWS.map(r => (
                    <DetailCard
                      key={r.id}
                      title={r.cycle}
                      badge={r.status}
                      badgeColor={r.status.includes('Clôturé') ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-sky-500/10 text-sky-400 border-sky-500/30'}
                      icon={Award}
                      subtitle={`Cible : ${r.target} • Échéance : ${r.deadline}`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400">Grille : <strong className="text-slate-200">Compétences + Impact Business</strong></span>
                        <button 
                          onClick={() => showToast(`Grille de revue ${r.cycle} ouverte`)}
                          className="text-emerald-400 font-semibold hover:underline"
                        >
                          Remplir ma grille →
                        </button>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}

          {/* TAB 4: PERKS */}
          {activeTab === 'perks' && (
            <motion.div
              key="perks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DetailSection
                title="Package d'Avantages Sociaux"
                subtitle="Politique de bien-être et de rémunération globale"
                icon={Coffee}
                badge="3 Avantages Actifs"
                kpis={[
                  { label: 'Budget Moyen/Employé', value: '$450/m', sub: 'Hors salaire' },
                  { label: 'Taux Utilisation', value: '98%', sub: 'Très plébiscité' },
                  { label: 'Indice Bien-Être', value: '9.6/10', sub: 'Benchmark top 1%' }
                ]}
              >
                <div className="space-y-3">
                  {PERKS.map(p => (
                    <DetailCard
                      key={p.id}
                      title={p.title}
                      badge={p.val}
                      badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      icon={Coffee}
                      subtitle={`Catégorie : ${p.cat}`}
                    >
                      <div className="flex justify-between items-center pt-1 text-xs">
                        <span className="text-slate-400">Activation : <strong className="text-slate-200">Automatique dès l'onboarding</strong></span>
                        <span className="text-slate-500 text-[11px]">Détails du contrat →</span>
                      </div>
                    </DetailCard>
                  ))}
                </div>
              </DetailSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SLIDE-OVER EMPLOYEE INSPECTOR */}
      <DetailDrawer
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        title={selectedEmployee?.name || ''}
        subtitle={`${selectedEmployee?.role} • ${selectedEmployee?.dept}`}
        badge={selectedEmployee?.status}
        badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        avatarText={selectedEmployee?.name.charAt(0)}
        actions={[
          {
            id: 'call',
            label: 'Lancer Visio',
            icon: Phone,
            variant: 'primary',
            onClick: () => showToast(`Visio RH lancée avec ${selectedEmployee?.name}`)
          },
          {
            id: 'email',
            label: 'Envoyer Email',
            icon: Mail,
            onClick: () => showToast(`Message envoyé à ${selectedEmployee?.email}`)
          },
          {
            id: 'review',
            label: 'Fiche Paie PDF',
            icon: FileText,
            onClick: () => showToast(`Dernier bulletin de paie généré pour ${selectedEmployee?.name}`)
          }
        ]}
        kpis={[
          { label: 'Rémunération', value: selectedEmployee?.salary || '', sub: 'Brut mensuel' },
          { label: 'Ancienneté', value: selectedEmployee?.start || '', sub: 'En poste' },
          { label: 'Département', value: selectedEmployee?.dept || '', sub: 'Pôle d\'expertise' },
          { label: 'Statut RH', value: selectedEmployee?.status || '', sub: 'Contrat CDI Cadre' }
        ]}
        aiInsight={{
          title: 'Synthèse Carrière Coach AI',
          content: `${selectedEmployee?.bio} Prochaine étape : passage au statut Principal ou Direction de pôle.`,
          actionLabel: 'Générer proposition d\'évolution de poste',
          onAction: () => showToast('Proposition d\'évolution générée')
        }}
        tabs={[
          {
            id: 'skills',
            label: `Compétences (${selectedEmployee?.skills.length || 0})`,
            content: (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee?.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400 font-mono">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                  <span className="font-semibold text-slate-200">Dernière Évaluation Performance</span>
                  <p className="text-slate-400 leading-relaxed">{selectedEmployee?.lastReview}</p>
                </div>
              </div>
            )
          },
          {
            id: 'contact',
            label: 'Coordonnées',
            content: (
              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Email professionnel:</span>
                  <span className="text-slate-200 font-mono">{selectedEmployee?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Téléphone:</span>
                  <span className="text-slate-200 font-mono">{selectedEmployee?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Régime horaire:</span>
                  <span className="text-emerald-400 font-medium">Forfait Jours (Autonome)</span>
                </div>
              </div>
            )
          }
        ]}
      />

      {/* Floating Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-xl"
          >
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
