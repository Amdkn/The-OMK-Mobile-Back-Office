import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  DollarSign, 
  User, 
  AlertTriangle, 
  FileText, 
  Plus, 
  ChevronRight, 
  Download,
  Flame,
  Check
} from 'lucide-react';
import { Project, Milestone, Deliverable, ClientStorageService, Client } from '../../../services/clientStorage';
import { haptics } from '../../../services/haptics';
import { AppEventBus } from '../../../services/eventBus';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  client: Client | null;
  workspace: string;
  onUpdateProject?: (updatedProject: Project) => void;
  onToast: (msg: string) => void;
}

export default function ProjectDetailModal({
  isOpen,
  onClose,
  project,
  client,
  workspace,
  onUpdateProject,
  onToast
}: ProjectDetailModalProps) {
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  if (!isOpen || !project || !client) return null;

  const handleToggleMilestone = (milestoneId: string) => {
    const updatedMilestones = (project.milestones || []).map(m => {
      if (m.id === milestoneId) {
        return { ...m, completed: !m.completed };
      }
      return m;
    });

    // Calculate auto progress based on completed milestones
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const totalCount = updatedMilestones.length;
    const calculatedProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : project.progress;
    const calculatedStatus = calculatedProgress === 100 ? 'completed' : project.status === 'completed' ? 'in-progress' : project.status;

    const updatedProject: Project = {
      ...project,
      milestones: updatedMilestones,
      progress: calculatedProgress,
      status: calculatedStatus
    };

    // Save to storage
    const updatedProjects = client.projects.map(p => p.id === project.id ? updatedProject : p);
    ClientStorageService.updateClient(client.id, { projects: updatedProjects }, workspace);

    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }

    AppEventBus.emit('PROJECT_UPDATED', 'clients', {
      clientId: client.id,
      projectId: project.id,
      milestoneId,
      progress: calculatedProgress
    });

    haptics.trigger('selection');
    onToast(`Jalon mis à jour (${calculatedProgress}% d'avancement)`);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    const newMilestone: Milestone = {
      id: `m-${Date.now()}`,
      title: newMilestoneTitle.trim(),
      dueDate: newMilestoneDate.trim() || 'Fin de mois',
      completed: false,
      owner: project.lead || 'Chef de Projet'
    };

    const updatedMilestones = [...(project.milestones || []), newMilestone];
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const totalCount = updatedMilestones.length;
    const calculatedProgress = Math.round((completedCount / totalCount) * 100);

    const updatedProject: Project = {
      ...project,
      milestones: updatedMilestones,
      progress: calculatedProgress
    };

    const updatedProjects = client.projects.map(p => p.id === project.id ? updatedProject : p);
    ClientStorageService.updateClient(client.id, { projects: updatedProjects }, workspace);

    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }

    haptics.trigger('success');
    onToast('Nouveau jalon ajouté au projet');
    setNewMilestoneTitle('');
    setNewMilestoneDate('');
    setIsAddingMilestone(false);
  };

  const handleUpdateStatus = (newStatus: Project['status']) => {
    const newProgress = newStatus === 'completed' ? 100 : project.progress;
    const updatedProject: Project = {
      ...project,
      status: newStatus,
      progress: newProgress
    };

    const updatedProjects = client.projects.map(p => p.id === project.id ? updatedProject : p);
    ClientStorageService.updateClient(client.id, { projects: updatedProjects }, workspace);

    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }

    haptics.trigger('medium');
    onToast(`Statut du projet passé à "${newStatus}"`);
  };

  const handleManualProgressChange = (val: number) => {
    const updatedProject: Project = {
      ...project,
      progress: val,
      status: val === 100 ? 'completed' : project.status === 'completed' ? 'in-progress' : project.status
    };

    const updatedProjects = client.projects.map(p => p.id === project.id ? updatedProject : p);
    ClientStorageService.updateClient(client.id, { projects: updatedProjects }, workspace);

    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }

    haptics.trigger('light');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header with Breadcrumb & Close */}
          <div className="px-4 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <nav aria-label="Fil d'Ariane Projet" className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 overflow-x-auto scrollbar-hide">
              <span className="text-slate-400 font-medium truncate">{client.name}</span>
              <ChevronRight size={12} className="text-slate-500 shrink-0" />
              <span className="text-slate-400 shrink-0">Projets</span>
              <ChevronRight size={12} className="text-slate-500 shrink-0" />
              <span className="text-slate-100 font-bold truncate">{project.name}</span>
            </nav>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            {/* Project Hero Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/80 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      project.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : project.status === 'on-hold'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                    }`}>
                      {project.status === 'completed' ? 'Terminé & Livré' : project.status === 'on-hold' ? 'En Pause' : 'En Cours Actif'}
                    </span>
                    {project.priority && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        project.priority === 'Critique'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                      }`}>
                        <Flame size={10} />
                        Priorité {project.priority}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{project.name}</h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xl font-black font-mono text-emerald-400">{project.progress}%</span>
                  <div className="text-[10px] text-slate-400">Avancement Global</div>
                </div>
              </div>

              {project.description && (
                <p className="text-slate-300 text-xs leading-relaxed">{project.description}</p>
              )}

              {/* Progress Slider Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Ajustement rapide :</span>
                  <div className="flex gap-1">
                    {[25, 50, 75, 100].map(p => (
                      <button
                        key={p}
                        onClick={() => handleManualProgressChange(p)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-colors ${
                          project.progress === p
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-800/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 px-2 font-medium">Statut :</span>
              {(['in-progress', 'on-hold', 'completed'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(st)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
                    project.status === st
                      ? st === 'completed' 
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : st === 'on-hold'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-sky-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'completed' ? 'Terminé' : st === 'on-hold' ? 'En Pause' : 'En Cours'}
                </button>
              ))}
            </div>

            {/* Project Specs & Financials KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <DollarSign size={11} className="text-emerald-400" />
                  Budget Alloué
                </div>
                <div className="font-mono font-bold text-slate-100 text-sm mt-0.5">
                  ${(project.budget || 30000).toLocaleString()}
                </div>
                <div className="text-[9px] text-slate-500">
                  Consommé: ${(project.spent || Math.round((project.budget || 30000) * (project.progress / 100))).toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <User size={11} className="text-sky-400" />
                  Responsable Lead
                </div>
                <div className="font-semibold text-slate-100 text-xs mt-0.5 truncate">
                  {project.lead || 'Équipe Technique'}
                </div>
                <div className="text-[9px] text-slate-500 truncate">Interlocuteur clé</div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Calendar size={11} className="text-amber-400" />
                  Date Début
                </div>
                <div className="font-mono font-semibold text-slate-100 text-xs mt-0.5">
                  {project.startDate || '01 Juil 2026'}
                </div>
                <div className="text-[9px] text-slate-500">Lancement</div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock size={11} className="text-purple-400" />
                  Date Cible
                </div>
                <div className="font-mono font-semibold text-emerald-400 text-xs mt-0.5">
                  {project.dueDate}
                </div>
                <div className="text-[9px] text-slate-500">Livraison finale</div>
              </div>
            </div>

            {/* Interactive Milestones Section */}
            <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                    Jalons & Livrables ({project.milestones?.filter(m => m.completed).length || 0}/{project.milestones?.length || 0})
                  </div>
                  <div className="text-[10px] text-slate-400">Cochez un jalon pour valider l'étape</div>
                </div>

                <button
                  onClick={() => setIsAddingMilestone(!isAddingMilestone)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} />
                  <span>Ajouter Jalon</span>
                </button>
              </div>

              {/* Add Milestone Form */}
              <AnimatePresence>
                {isAddingMilestone && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddMilestone}
                    className="p-3 bg-slate-900/90 rounded-xl border border-emerald-500/30 space-y-2"
                  >
                    <div className="text-[11px] font-semibold text-slate-200">Nouveau Jalon Clé</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        placeholder="Ex: Validation pentest de sécurité"
                        className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500/50"
                        required
                      />
                      <input
                        type="text"
                        value={newMilestoneDate}
                        onChange={(e) => setNewMilestoneDate(e.target.value)}
                        placeholder="Échéance (ex: 15 Déc 2026)"
                        className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingMilestone(false)}
                        className="px-2.5 py-1 text-slate-400 hover:text-slate-200 text-xs"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Milestones List */}
              <div className="space-y-2">
                {project.milestones && project.milestones.length > 0 ? (
                  project.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      onClick={() => handleToggleMilestone(milestone.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        milestone.completed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                          milestone.completed
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                            : 'border border-slate-600 hover:border-slate-400'
                        }`}>
                          {milestone.completed ? <Check size={13} strokeWidth={3} /> : null}
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-medium truncate ${milestone.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                            {milestone.title}
                          </div>
                          {milestone.owner && (
                            <div className="text-[10px] text-slate-500">Resp: {milestone.owner}</div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[10px] font-mono ${milestone.completed ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                          {milestone.dueDate}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
                    Aucun jalon configuré. Cliquez sur "Ajouter Jalon" pour structurer la livraison.
                  </div>
                )}
              </div>
            </div>

            {/* Deliverables Section */}
            {project.deliverables && project.deliverables.length > 0 && (
              <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Documents & Livrables Produits ({project.deliverables.length})
                </div>
                <div className="space-y-1.5">
                  {project.deliverables.map((deliv, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={14} className="text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-mono text-slate-200 text-xs truncate">{deliv.name}</div>
                          <div className="text-[10px] text-slate-500">{deliv.type}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          haptics.trigger('light');
                          onToast(`Téléchargement de ${deliv.name}...`);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <Download size={11} />
                        <span>Télécharger</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
