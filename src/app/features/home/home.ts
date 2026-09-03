import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface HomeFeature {
  readonly title: string;
  readonly description: string;
  readonly iconPath: string;
}

interface DemoStep {
  readonly number: string;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly features: readonly HomeFeature[] = [
    {
      title: 'Catalogue produits',
      description:
        'Centralisez les références, les prix, les seuils minimums et les informations utiles.',
      iconPath: 'm12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v9m8-4.5-8 4.5m-8-4.5 8 4.5',
    },
    {
      title: 'Catégories structurées',
      description: 'Organisez le catalogue pour retrouver rapidement chaque famille de produits.',
      iconPath: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
    },
    {
      title: 'Suivi des fournisseurs',
      description:
        'Conservez les contacts et coordonnées de vos partenaires dans un espace unique.',
      iconPath:
        'M14 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-1A4.5 4.5 0 0 0 4 18.5V20m5-10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1a2.5 2.5 0 1 0 0-5m1 8.5a4 4 0 0 1 3 3.87V20',
    },
    {
      title: 'Mouvements traçables',
      description:
        'Enregistrez chaque entrée et sortie tout en laissant le serveur garantir le stock réel.',
      iconPath: 'M7 7h11m0 0-3-3m3 3-3 3m2 7H6m0 0 3 3m-3-3 3-3',
    },
    {
      title: 'Alertes de stock faible',
      description: 'Identifiez immédiatement les références à réapprovisionner avant la rupture.',
      iconPath: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4',
    },
    {
      title: 'Dashboard opérationnel',
      description:
        'Visualisez les indicateurs clés et les mouvements récents depuis une vue synthétique.',
      iconPath: 'M4 19V9m5 10V5m5 14v-7m5 7V3',
    },
  ];

  protected readonly demoSteps: readonly DemoStep[] = [
    {
      number: '01',
      title: 'Ouvrez la connexion',
      description: 'Le compte public de démonstration est déjà renseigné dans le formulaire.',
    },
    {
      number: '02',
      title: 'Cliquez sur Se connecter',
      description: 'Aucune inscription ni saisie supplémentaire n’est nécessaire.',
    },
    {
      number: '03',
      title: 'Explorez StockFlow',
      description: 'Testez librement le catalogue, les mouvements, les alertes et le dashboard.',
    },
  ];
}
