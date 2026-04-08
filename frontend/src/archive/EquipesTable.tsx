import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from "react"
import axiosClient from "@/services/axiosClient"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,AlertDialogTrigger,} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, CheckCircle2, X, Users, Search, UserPlus, Eye, Mail, User } from "lucide-react"
import NotificationBanner from "@/components/common/NotificationBanner"
import SearchInput from "@/components/common/SearchInput"
import UserAvatar from "@/components/common/UserAvatar"
import DashboardPageLayout from "@/components/layout/DashboardPageLayout"

// Lazy load des composants lourds
const LazyDialog = lazy(() => import("@/components/ui/dialog").then(module => ({ default: module.Dialog })))

/**
 * Composant de gestion des équipes par axe de recherche
 * Permet de gérer les membres assignés à chaque axe avec leurs positions
 */

// Types
interface Membre {
  id: number
  nom: string
  prenom: string
  email: string
  avatar?: string
  pivot?: {
    id: number
    position: string
  }
}

interface Axe {
  id: number
  title: string
  slug: string
  icon?: string
  membres_count?: number
  membres?: Membre[]
}

interface AxeMembre {
  id: number
  axe_id: number
  membre_id: number
  position: string
  membre: Membre
}

interface Position {
  value: string
  label: string
}

// Positions disponibles
const positions: Position[] = [
  { value: "responsable", label: "Responsable" },
  { value: "coordinateur", label: "Coordinateur" },
  { value: "chercheur", label: "Chercheur" },
  { value: "doctorant", label: "Doctorant" },
  { value: "membre", label: "Membre" },
]

export default function MembresParAxePage() {
  // États initialisés avec des tableaux vides
  const [axes, setAxes] = useState<Axe[]>([])
  const [membres, setMembres] = useState<Membre[]>([])
  const [axeMembres, setAxeMembres] = useState<AxeMembre[]>([])
  const [selectedAxe, setSelectedAxe] = useState<Axe | null>(null)
  const [filteredAxeMembres, setFilteredAxeMembres] = useState<AxeMembre[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // États pour les modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [editingAxeMembre, setEditingAxeMembre] = useState<AxeMembre | null>(null)
  const [viewingMembre, setViewingMembre] = useState<Membre | null>(null)

  // États pour le formulaire
  const [selectedMembreId, setSelectedMembreId] = useState("")
  const [selectedPosition, setSelectedPosition] = useState("")

  // États pour les notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Charger les données initiales
  // Optimisation avec useCallback pour les notifications
  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000); // Nettoyage de la notification après 5 secondes
  }, []);
  // Optimisation avec useCallback pour le chargement des données
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [axesRes, membresRes, axeMembresRes] = await Promise.all([
        axiosClient.get("/api/admin/axes"),
        axiosClient.get("/api/admin/membres"),
        axiosClient.get("/api/admin/axe-membre")
      ]);

      // Log raw data
      console.log('Raw API responses:', {
        axes: axesRes.data,
        membres: membresRes.data,
        axeMembres: axeMembresRes.data
      })

      // Ensure we always have arrays, even if empty
      const axesData = Array.isArray(axesRes.data) ? axesRes.data 
        : Array.isArray(axesRes.data.data) ? axesRes.data.data 
        : []
      
      // Gestion spéciale pour les membres qui sont dans data.data.membres
      const membresData = Array.isArray(membresRes.data) ? membresRes.data 
        : Array.isArray(membresRes.data.data) ? membresRes.data.data 
        : []
      
      const axeMembresData = Array.isArray(axeMembresRes.data.data) ? axeMembresRes.data.data 
        : Array.isArray(axeMembresRes.data) ? axeMembresRes.data 
        : []

      // Log processed data
      console.log('Processed data:', {
        axes: axesData,
        membres: membresData,
        axeMembres: axeMembresData
      })

      setAxes(axesData)
      setMembres(membresData)
      setAxeMembres(axeMembresData)

      if (axesData.length > 0) {
        setSelectedAxe(axesData[0])
      }
    } catch (err) {
      console.error("Erreur de chargement initial :", err)
      showNotification("error", "Impossible de charger les données initiales")
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  // Optimisation avec useMemo pour les membres disponibles
  const availableMembres = useMemo(() => {
    if (!Array.isArray(membres) || !selectedAxe || !Array.isArray(axeMembres)) {
      console.log('Invalid data:', { membres, selectedAxe, axeMembres }) // Debug log
      return []
    }
    
    return membres.filter(membre => 
      !axeMembres.some(am => am.axe_id === selectedAxe.id && am.membre_id === membre.id)
    )
  }, [membres, selectedAxe, axeMembres])

  // Optimisation avec useMemo pour le filtrage par recherche
  const searchFilteredMembres = useMemo(() => {
    if (!Array.isArray(filteredAxeMembres)) {
      return [];
    }

    if (!searchTerm) {
      return filteredAxeMembres;
    }

    const search = searchTerm.toLowerCase();
    return filteredAxeMembres.filter(axeMembre => {
      if (!axeMembre?.membre) {
        return false;
      }

      const membre = axeMembre.membre;
      const fullName = `${membre.prenom || ''} ${membre.nom || ''}`.toLowerCase();
      const email = (membre.email || '').toLowerCase();
      const position = (axeMembre.position || '').toLowerCase();

      return fullName.includes(search) || 
             email.includes(search) || 
             position.includes(search);
    });
  }, [filteredAxeMembres, searchTerm]);

  // Filtrer les membres de l'axe sélectionné
  useEffect(() => {
    if (!selectedAxe || !Array.isArray(axeMembres)) {
      setFilteredAxeMembres([]);
      return;
    }

    // Si l'axe a déjà des membres pré-chargés, les utiliser
    if (selectedAxe.membres && selectedAxe.membres.length > 0) {
      const membresWithPosition = selectedAxe.membres.map(membre => ({
        id: membre.pivot?.id || 0,
        axe_id: selectedAxe.id,
        membre_id: membre.id,
        position: membre.pivot?.position || 'membre',
        membre: membre
      }));
      setFilteredAxeMembres(membresWithPosition);
      return;
    }

    // Sinon, filtrer à partir de axeMembres
    const filtered = axeMembres.filter(am => am.axe_id === selectedAxe.id);
    setFilteredAxeMembres(filtered);
  }, [selectedAxe?.id, axeMembres]);

  // Optimisation avec useCallback pour les fonctions d'action
  const handleSelectAxe = useCallback((axe: Axe) => {
    setSelectedAxe(axe);
    setSearchTerm("");
  }, []);

  const openAddModal = useCallback(() => {
    setSelectedMembreId("");
    setSelectedPosition("");
    setIsAddModalOpen(true);
  }, []);

  const openEditModal = useCallback((axeMembre: AxeMembre) => {
    setEditingAxeMembre(axeMembre);
    setSelectedMembreId(axeMembre.membre_id.toString());
    setSelectedPosition(axeMembre.position);
    setIsEditModalOpen(true);
  }, []);

  const openDetailsModal = useCallback((membre: Membre) => {
    setViewingMembre(membre);
    setIsDetailsModalOpen(true);
  }, []);

  const handleAddMembre = useCallback(async () => {
    if (!selectedAxe || !selectedMembreId || !selectedPosition) {
      showNotification("error", "Veuillez remplir tous les champs");
      return;
    }

    // Vérifier si le membre est déjà dans cet axe
    const existingMembre = axeMembres.find(
      (am) => am.axe_id === selectedAxe.id && am.membre_id === parseInt(selectedMembreId)
    );

    if (existingMembre) {
      showNotification("error", "Ce membre fait déjà partie de cet axe");
      return;
    }

    const membre = membres.find((m) => m.id === parseInt(selectedMembreId));
    if (!membre) {
      showNotification("error", "Membre introuvable");
      return;
    }

    try { 
      // Appel API pour ajouter le membre
      const response = await axiosClient.post(`api/admin/axes/${selectedAxe.id}/membres`, {
        membre_id: parseInt(selectedMembreId),
        position: selectedPosition
      });

      const newAxeMembre: AxeMembre = response.data;
      setAxeMembres((prev) => [...prev, newAxeMembre]);
      
      setIsAddModalOpen(false);
      showNotification("success", "Membre ajouté avec succès à l'axe");
    } catch (error) {
      console.error("Erreur lors de l'ajout du membre:", error);
      showNotification("error", "Erreur lors de l'ajout du membre");
    }
  }, [selectedAxe, selectedMembreId, selectedPosition, axeMembres, membres, showNotification]);

  const handleEditPosition = useCallback(async () => {
    if (!editingAxeMembre || !selectedPosition) {
      showNotification("error", "Veuillez sélectionner une position");
      return;
    }

    try {
      // Appel API pour modifier la position
      await axiosClient.put(`api/admin/axe-membre/${editingAxeMembre.id}`, {
        position: selectedPosition
      });

      setAxeMembres((prev) =>
        prev.map((am) =>
          am.id === editingAxeMembre.id ? { ...am, position: selectedPosition } : am
        )
      );

      setIsEditModalOpen(false);
      setEditingAxeMembre(null);
      showNotification("success", "Position modifiée avec succès");
    } catch (error) {
      console.error("Erreur lors de la modification de la position:", error);
      showNotification("error", "Erreur lors de la modification de la position");
    }
  }, [editingAxeMembre, selectedPosition, showNotification]);

  const handleRemoveMembre = useCallback(async (axeMembreId: number) => {
    try {
      // Appel API pour retirer le membre
      await axiosClient.delete(`api/admin/axe-membre/${axeMembreId}`);
      
      setAxeMembres((prev) => prev.filter((am) => am.id !== axeMembreId));
      showNotification("success", "Membre retiré de l'axe avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      showNotification("error", "Erreur lors de la suppression du membre");
    }
  }, [showNotification]);

  return (
    <DashboardPageLayout
      title="Gestion des Équipes de Recherche"
      description="Gérez les membres par axe de recherche"
      icon={Users}
      iconColor="text-blue-600"
      onAdd={openAddModal}
      addButtonText="Ajouter un membre"
      showSearch={true}
      searchPlaceholder="Rechercher un membre..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      showStats={false}
    >
      {/* Onglets des axes */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {axes.map((axe) => (
            <button
              key={axe.id}
              onClick={() => handleSelectAxe(axe)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedAxe?.id === axe.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <span>{axe.title.split(' ')[0]}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Notification */}
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          autoClose={true}
        />
      )}

      {/* Contenu de l'axe sélectionné */}
      {selectedAxe && (
        <div className="space-y-6">
          {/* Header de l'axe avec actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedAxe.title}</h2>
                <p className="text-gray-600">
                  {searchFilteredMembres.length} membre{searchFilteredMembres.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>          
          </div>

          {/* Tableau des membres */}
          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600">Chargement...</div>
            </div>
          ) : searchFilteredMembres.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun membre trouvé</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "Aucun membre ne correspond à votre recherche" : "Cet axe n'a pas encore de membres"}
                </p>
                {!searchTerm && (
                  <Button onClick={openAddModal} className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Ajouter le premier membre
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchFilteredMembres.map((axeMembre) => {
                      if (!axeMembre?.membre) return null; // Skip if membre is undefined
                      const { membre } = axeMembre;
                      
                      return (
                        <TableRow key={`${axeMembre.axe_id}-${axeMembre.membre_id}-${axeMembre.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                src={membre?.avatar || "/placeholder.svg"}
                                alt={`${membre?.prenom || ''} ${membre?.nom || ''}`}
                                fallback={`${membre?.prenom || ''} ${membre?.nom || ''}`}
                                size="sm"
                              />
                              <div>
                                <div className="font-medium">
                                  {membre?.prenom || ''} {membre?.nom || ''}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              {membre?.email || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{axeMembre?.position || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDetailsModal(membre)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(axeMembre)}
                                className="flex items-center gap-1"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Retirer le membre</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir retirer {membre?.prenom || ''} {membre?.nom || ''} de
                                      l'axe "{selectedAxe?.title || ''}" ?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveMembre(axeMembre.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Retirer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal d'ajout de membre */}
      <Suspense fallback={<div>Chargement...</div>}>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un membre à l'axe</DialogTitle>
              <DialogDescription>
                Sélectionnez un membre et sa position dans l'axe "{selectedAxe?.title}"
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="membre">Membre</Label>
                <Select value={selectedMembreId} onValueChange={setSelectedMembreId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un membre" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembres.map((membre) => (
                      <SelectItem key={membre.id} value={membre.id.toString()}>
                        {membre.prenom} {membre.nom} - {membre.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position.value} value={position.label}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddMembre}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Suspense>

      {/* Modal de modification de position */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la position</DialogTitle>
            <DialogDescription>
              Modifiez la position de {editingAxeMembre?.membre.prenom} {editingAxeMembre?.membre.nom} dans l'axe "
              {selectedAxe?.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position.value} value={position.label}>
                      {position.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditPosition}>Modifier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de détails du membre */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du membre</DialogTitle>
          </DialogHeader>

          {viewingMembre && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <UserAvatar
                  src={viewingMembre.avatar || "/placeholder.svg"}
                  alt={`${viewingMembre.prenom || ''} ${viewingMembre.nom || ''}`}
                  fallback={`${viewingMembre.prenom || ''} ${viewingMembre.nom || ''}`}
                  size="lg"
                />
                <div>
                  <h3 className="text-lg font-semibold">
                    {viewingMembre.prenom} {viewingMembre.nom}
                  </h3>
                  <p className="text-gray-600">{viewingMembre.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{viewingMembre.email}</span>
                </div>
              </div>

              {/* Axes du membre */}
              <div>
                <Label className="text-sm font-semibold">Axes de recherche</Label>
                <div className="mt-2 space-y-2">
                  {axeMembres
                    .filter((am) => am.membre_id === viewingMembre.id)
                    .map((am) => {
                      const axe = axes.find((a) => a.id === am.axe_id)
                      return (
                        <div key={am.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            {axe?.icon && <span>{axe.icon}</span>}
                            <span className="text-sm font-medium">{axe?.title}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {am.position}
                          </Badge>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  )
}
