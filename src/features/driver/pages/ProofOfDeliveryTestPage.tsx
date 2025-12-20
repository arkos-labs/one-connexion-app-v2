import { useState } from 'react';
import { ProofOfDeliveryDrawer } from '@/features/driver/components/ProofOfDeliveryDrawer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * Page de test pour le composant ProofOfDeliveryDrawer
 * 
 * Cette page permet de tester les fonctionnalités :
 * - Ouverture/fermeture du drawer
 * - Capture de signature
 * - Capture de photo (simulée)
 * - Validation et annulation
 */
export const ProofOfDeliveryTestPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [lastProof, setLastProof] = useState<{
        type: 'signature' | 'photo';
        data: string;
        timestamp: string;
    } | null>(null);

    const handleProofConfirmed = (proofType: 'signature' | 'photo', proofData: string) => {
        console.log('Preuve capturée:', { proofType, proofData });

        setLastProof({
            type: proofType,
            data: proofData,
            timestamp: new Date().toLocaleString('fr-FR')
        });

        toast.success(`Preuve de type "${proofType}" capturée avec succès !`, {
            description: `Taille des données: ${(proofData.length / 1024).toFixed(2)} KB`
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                        Test de Preuve de Livraison
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Testez les fonctionnalités de signature et de photo
                    </p>
                </div>

                {/* Bouton de test */}
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        onClick={() => setIsDrawerOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        📦 Ouvrir le Drawer de Preuve
                    </Button>
                </div>

                {/* Affichage de la dernière preuve */}
                {lastProof && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Dernière Preuve Capturée
                            </h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLastProof(null)}
                            >
                                Effacer
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Type</p>
                                <p className="text-lg font-bold capitalize">
                                    {lastProof.type === 'signature' ? '✍️ Signature' : '📸 Photo'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Horodatage</p>
                                <p className="text-lg font-bold">{lastProof.timestamp}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Aperçu</p>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-900">
                                {lastProof.type === 'signature' ? (
                                    <img
                                        src={lastProof.data}
                                        alt="Signature capturée"
                                        className="max-w-full h-auto mx-auto bg-white rounded-lg shadow-md"
                                        style={{ maxHeight: '200px' }}
                                    />
                                ) : (
                                    <img
                                        src={lastProof.data}
                                        alt="Photo capturée"
                                        className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                                        style={{ maxHeight: '300px' }}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Données (Base64)</p>
                            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                                <code className="text-gray-700 dark:text-gray-300">
                                    {lastProof.data.substring(0, 100)}...
                                </code>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Taille totale: {(lastProof.data.length / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                        📋 Instructions de test
                    </h3>
                    <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                        <li className="flex items-start gap-2">
                            <span className="font-bold">1.</span>
                            <span>Cliquez sur le bouton pour ouvrir le drawer</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">2.</span>
                            <span>Choisissez entre "Signature" ou "Photo"</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">3.</span>
                            <span>
                                <strong>Signature:</strong> Dessinez avec votre souris/doigt, puis validez
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">4.</span>
                            <span>
                                <strong>Photo:</strong> Cliquez sur le déclencheur, attendez 1.5s, puis validez
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">5.</span>
                            <span>La preuve capturée s'affichera ci-dessus</span>
                        </li>
                    </ul>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md">
                        <p className="text-3xl font-bold text-blue-600">✍️</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Signature</p>
                        <p className="text-xs text-gray-400">Canvas tactile</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md">
                        <p className="text-3xl font-bold text-green-600">📸</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Photo</p>
                        <p className="text-xs text-gray-400">Simulateur</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md">
                        <p className="text-3xl font-bold text-purple-600">🔒</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Sécurisé</p>
                        <p className="text-xs text-gray-400">Base64 PNG</p>
                    </div>
                </div>

            </div>

            {/* Drawer Component */}
            <ProofOfDeliveryDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onConfirm={handleProofConfirmed}
            />
        </div>
    );
};
