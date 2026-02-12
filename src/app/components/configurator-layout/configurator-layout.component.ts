import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { animate, style, transition, trigger } from '@angular/animations';
import { ConfigFormComponent } from '../config-form/config-form.component';
import { WidgetPreviewComponent } from '../widget-preview/widget-preview.component';
import { IntegrationModalComponent } from '../integration-modal/integration-modal.component';
import { DEFAULT_CONFIG, GlobalConfig } from '../../models/config.model';
import { THEMES } from '../../models/themes.model';

@Component({
  selector: 'app-configurator-layout',
  standalone: true,
  imports: [
    ConfigFormComponent,
    WidgetPreviewComponent,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule
  ],
  animations: [
    trigger('sidenavWidth', [
      transition(':enter', [
        style({ width: 0 }),
        animate('300ms ease-out', style({ width: '*' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ width: 0 })),
      ]),
    ]),
  ],
  template: `
    <mat-sidenav-container class="app-layout" autosize>
      <mat-sidenav #sidenav mode="side" opened class="config-pane" [style.width.px]="isCollapsed() ? 40 : 400">
        <div class="toggle-button-wrapper">
          <button mat-mini-fab color="primary" (click)="toggleCollapse()" class="toggle-button">
            <mat-icon>{{ isCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>
        <div class="config-content-wrapper">
          <div class="config-content" [class.hidden]="isCollapsed()">
            <app-config-form [initialConfig]="config()" (configChange)="onConfigChange($event)" (generate)="openModal()">
            </app-config-form>
          </div>
        </div>
      </mat-sidenav>
      <mat-sidenav-content class="preview-pane">
        <app-widget-preview [config]="config()"></app-widget-preview>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
    .app-layout {
      height: 100%;
      width: 100%;
    }
    .config-pane {
      border-right: 1px solid #e0e0e0;
      transition: width 0.3s ease-in-out;
      overflow: visible; /* Allow button to overlap */
      background: white; 
    }
    .config-content-wrapper {
      width: 100%;
      height: 100%;
      overflow-x: hidden;
    }
    .config-content {
      width: 400px;
      height: 100%;
      overflow-y: auto;
      transition: opacity 0.2s ease-in-out;
    }
    .config-content.hidden {
      opacity: 0;
      pointer-events: none;
    }
    .preview-pane {
      position: relative;
      height: 100%;
      overflow: hidden;
      display: flex;
    }
    app-widget-preview {
      flex: 1;
      height: 100%;
    }
    .toggle-button-wrapper {
        position: absolute;
        top: 50%;
        right: -20px; /* Half the button width (approx 40px) to center on border */
        z-index: 40;
        transform: translateY(-50%);
    }
    .toggle-button {
      box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
    }
  `]
})
export class ConfiguratorLayoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  config = signal<GlobalConfig>(DEFAULT_CONFIG);
  isCollapsed = signal(false);
  private skipNextParamsUpdate = false;

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (this.skipNextParamsUpdate) {
        this.skipNextParamsUpdate = false;
        return;
      }

      if (Object.keys(params).length === 0) {
        if (JSON.stringify(DEFAULT_CONFIG) !== JSON.stringify(this.config())) {
          this.config.set(DEFAULT_CONFIG);
        }
        return;
      }

      const parseArrayParam = (key: string, defaultValue?: number[]): number[] => {
        if (!(key in params)) return defaultValue ?? [];
        const val = params[key];
        if (val === '' || val === null || val === undefined) return [];
        return val.split(',').map(Number);
      };

      const newConfig: GlobalConfig = {
        api: params['api'] || DEFAULT_CONFIG.api,
        language: params['language'] || DEFAULT_CONFIG.language,
        districts: parseArrayParam('districts', (params['api'] && params['api'] !== DEFAULT_CONFIG.api) ? [] : DEFAULT_CONFIG.districts),
        themes: parseArrayParam('themes', DEFAULT_CONFIG.themes),
        practices: parseArrayParam('practices', DEFAULT_CONFIG.practices),
        structure: parseArrayParam('structure', DEFAULT_CONFIG.structure),
        city: parseArrayParam('city', DEFAULT_CONFIG.city),
        inBbox: params['inBbox'] || DEFAULT_CONFIG.inBbox,
        portals: parseArrayParam('portals', DEFAULT_CONFIG.portals),
        routes: parseArrayParam('routes', DEFAULT_CONFIG.routes),
        labels: parseArrayParam('labels', DEFAULT_CONFIG.labels),

        colorPrimaryContainer: params['colorPrimaryContainer'] || DEFAULT_CONFIG.colorPrimaryContainer,
        nameLayer: params['nameLayer'] || DEFAULT_CONFIG.nameLayer,
        urlLayer: params['urlLayer'] || DEFAULT_CONFIG.urlLayer,
        attributionLayer: params['attributionLayer'] || DEFAULT_CONFIG.attributionLayer,
        treks: params['treks'] === undefined ? DEFAULT_CONFIG.treks : params['treks'] === 'true',
        touristicContents: params['touristicContents'] === undefined ? DEFAULT_CONFIG.touristicContents : params['touristicContents'] === 'true',
        touristicEvents: params['touristicEvents'] === undefined ? DEFAULT_CONFIG.touristicEvents : params['touristicEvents'] === 'true',
        outdoor: params['outdoor'] === undefined ? DEFAULT_CONFIG.outdoor : params['outdoor'] === 'true',

        // Appearance
        colorPrimaryApp: params['colorPrimaryApp'] || DEFAULT_CONFIG.colorPrimaryApp,
        colorPrimary: params['colorPrimary'] || DEFAULT_CONFIG.colorPrimary,
        colorOnPrimary: params['colorOnPrimary'] || DEFAULT_CONFIG.colorOnPrimary,
        colorSurface: params['colorSurface'] || DEFAULT_CONFIG.colorSurface,
        colorOnSurface: params['colorOnSurface'] || DEFAULT_CONFIG.colorOnSurface,
        colorSurfaceVariant: params['colorSurfaceVariant'] || DEFAULT_CONFIG.colorSurfaceVariant,
        colorOnSurfaceVariant: params['colorOnSurfaceVariant'] || DEFAULT_CONFIG.colorOnSurfaceVariant,
        colorOnPrimaryContainer: params['colorOnPrimaryContainer'] || DEFAULT_CONFIG.colorOnPrimaryContainer,
        colorSecondaryContainer: params['colorSecondaryContainer'] || DEFAULT_CONFIG.colorSecondaryContainer,
        colorOnSecondaryContainer: params['colorOnSecondaryContainer'] || DEFAULT_CONFIG.colorOnSecondaryContainer,
        colorBackground: params['colorBackground'] || DEFAULT_CONFIG.colorBackground,
        colorSurfaceContainerHigh: params['colorSurfaceContainerHigh'] || DEFAULT_CONFIG.colorSurfaceContainerHigh,
        colorSurfaceContainerLow: params['colorSurfaceContainerLow'] || DEFAULT_CONFIG.colorSurfaceContainerLow,
        fabBackgroundColor: params['fabBackgroundColor'] || DEFAULT_CONFIG.fabBackgroundColor,
        fabColor: params['fabColor'] || DEFAULT_CONFIG.fabColor,
        rounded: params['rounded'] === undefined ? DEFAULT_CONFIG.rounded : params['rounded'] === 'true',

        // Map
        colorTrekLine: params['colorTrekLine'] || DEFAULT_CONFIG.colorTrekLine,
        colorSensitiveArea: params['colorSensitiveArea'] || DEFAULT_CONFIG.colorSensitiveArea,
        colorOutdoorArea: params['colorOutdoorArea'] || DEFAULT_CONFIG.colorOutdoorArea,
        colorMarkers: params['colorMarkers'] || DEFAULT_CONFIG.colorMarkers,
        colorClusters: params['colorClusters'] || DEFAULT_CONFIG.colorClusters,
        mainMarkerSize: params['mainMarkerSize'] ? Number(params['mainMarkerSize']) : DEFAULT_CONFIG.mainMarkerSize,
        selectedMainMarkerSize: params['selectedMainMarkerSize'] ? Number(params['selectedMainMarkerSize']) : DEFAULT_CONFIG.selectedMainMarkerSize,
        mainClusterSize: params['mainClusterSize'] ? Number(params['mainClusterSize']) : DEFAULT_CONFIG.mainClusterSize,
        commonMarkerSize: params['commonMarkerSize'] ? Number(params['commonMarkerSize']) : DEFAULT_CONFIG.commonMarkerSize,
        departureArrivalMarkerSize: params['departureArrivalMarkerSize'] ? Number(params['departureArrivalMarkerSize']) : DEFAULT_CONFIG.departureArrivalMarkerSize,
        pointReferenceMarkerSize: params['pointReferenceMarkerSize'] ? Number(params['pointReferenceMarkerSize']) : DEFAULT_CONFIG.pointReferenceMarkerSize,
        theme: params['theme'] || DEFAULT_CONFIG.theme,
      };

      if (newConfig.theme && newConfig.theme !== 'custom') {
        const theme = THEMES.find(t => t.value === newConfig.theme);
        if (theme) {
          Object.assign(newConfig, theme.colors);
        }
      }

      if (JSON.stringify(newConfig) !== JSON.stringify(this.config())) {
        this.config.set(newConfig);
      }
    });
  }

  onConfigChange(newConfig: GlobalConfig) {
    const nextConfig = { ...this.config(), ...newConfig };
    this.config.set(nextConfig);
    this.skipNextParamsUpdate = true;
    this.updateUrl(nextConfig);
  }

  updateUrl(c: GlobalConfig) {
    const arraysEqual = (a?: number[], b?: number[]) => {
      const aa = a ?? [], bb = b ?? [];
      return aa.length === bb.length && aa.every(v => bb.includes(v));
    };

    const queryParams: any = {
      api: c.api === DEFAULT_CONFIG.api ? null : c.api,
      language: c.language === DEFAULT_CONFIG.language ? null : c.language,
      districts: arraysEqual(c.districts, DEFAULT_CONFIG.districts) ? null : (c.districts?.length ? c.districts.join(',') : null),
      themes: arraysEqual(c.themes, DEFAULT_CONFIG.themes) ? null : (c.themes?.length ? c.themes.join(',') : null),
      practices: arraysEqual(c.practices, DEFAULT_CONFIG.practices) ? null : (c.practices?.length ? c.practices.join(',') : null),
      structure: arraysEqual(c.structure, DEFAULT_CONFIG.structure) ? null : (c.structure?.length ? c.structure.join(',') : null),
      city: arraysEqual(c.city, DEFAULT_CONFIG.city) ? null : (c.city?.length ? c.city.join(',') : null),
      inBbox: c.inBbox === DEFAULT_CONFIG.inBbox ? null : c.inBbox,
      portals: arraysEqual(c.portals, DEFAULT_CONFIG.portals) ? null : (c.portals?.length ? c.portals.join(',') : null),
      routes: arraysEqual(c.routes, DEFAULT_CONFIG.routes) ? null : (c.routes?.length ? c.routes.join(',') : null),
      labels: arraysEqual(c.labels, DEFAULT_CONFIG.labels) ? null : (c.labels?.length ? c.labels.join(',') : null),

      colorPrimaryContainer: c.colorPrimaryContainer === DEFAULT_CONFIG.colorPrimaryContainer ? null : c.colorPrimaryContainer,
      nameLayer: c.nameLayer === DEFAULT_CONFIG.nameLayer ? null : c.nameLayer,
      urlLayer: c.urlLayer === DEFAULT_CONFIG.urlLayer ? null : c.urlLayer,
      attributionLayer: c.attributionLayer === DEFAULT_CONFIG.attributionLayer ? null : c.attributionLayer,
      treks: c.treks === DEFAULT_CONFIG.treks ? null : c.treks,
      touristicContents: c.touristicContents === DEFAULT_CONFIG.touristicContents ? null : c.touristicContents,
      touristicEvents: c.touristicEvents === DEFAULT_CONFIG.touristicEvents ? null : c.touristicEvents,
      outdoor: c.outdoor === DEFAULT_CONFIG.outdoor ? null : c.outdoor,

      // Appearance
      colorPrimaryApp: c.colorPrimaryApp === DEFAULT_CONFIG.colorPrimaryApp ? null : c.colorPrimaryApp,
      colorPrimary: c.colorPrimary === DEFAULT_CONFIG.colorPrimary ? null : c.colorPrimary,
      colorOnPrimary: c.colorOnPrimary === DEFAULT_CONFIG.colorOnPrimary ? null : c.colorOnPrimary,
      colorSurface: c.colorSurface === DEFAULT_CONFIG.colorSurface ? null : c.colorSurface,
      colorOnSurface: c.colorOnSurface === DEFAULT_CONFIG.colorOnSurface ? null : c.colorOnSurface,
      colorSurfaceVariant: c.colorSurfaceVariant === DEFAULT_CONFIG.colorSurfaceVariant ? null : c.colorSurfaceVariant,
      colorOnSurfaceVariant: c.colorOnSurfaceVariant === DEFAULT_CONFIG.colorOnSurfaceVariant ? null : c.colorOnSurfaceVariant,
      colorOnPrimaryContainer: c.colorOnPrimaryContainer === DEFAULT_CONFIG.colorOnPrimaryContainer ? null : c.colorOnPrimaryContainer,
      colorSecondaryContainer: c.colorSecondaryContainer === DEFAULT_CONFIG.colorSecondaryContainer ? null : c.colorSecondaryContainer,
      colorOnSecondaryContainer: c.colorOnSecondaryContainer === DEFAULT_CONFIG.colorOnSecondaryContainer ? null : c.colorOnSecondaryContainer,
      colorBackground: c.colorBackground === DEFAULT_CONFIG.colorBackground ? null : c.colorBackground,
      colorSurfaceContainerHigh: c.colorSurfaceContainerHigh === DEFAULT_CONFIG.colorSurfaceContainerHigh ? null : c.colorSurfaceContainerHigh,
      colorSurfaceContainerLow: c.colorSurfaceContainerLow === DEFAULT_CONFIG.colorSurfaceContainerLow ? null : c.colorSurfaceContainerLow,
      fabBackgroundColor: c.fabBackgroundColor === DEFAULT_CONFIG.fabBackgroundColor ? null : c.fabBackgroundColor,
      fabColor: c.fabColor === DEFAULT_CONFIG.fabColor ? null : c.fabColor,
      rounded: c.rounded === DEFAULT_CONFIG.rounded ? null : c.rounded,

      // Map
      colorTrekLine: c.colorTrekLine === DEFAULT_CONFIG.colorTrekLine ? null : c.colorTrekLine,
      colorSensitiveArea: c.colorSensitiveArea === DEFAULT_CONFIG.colorSensitiveArea ? null : c.colorSensitiveArea,
      colorOutdoorArea: c.colorOutdoorArea === DEFAULT_CONFIG.colorOutdoorArea ? null : c.colorOutdoorArea,
      colorMarkers: c.colorMarkers === DEFAULT_CONFIG.colorMarkers ? null : c.colorMarkers,
      colorClusters: c.colorClusters === DEFAULT_CONFIG.colorClusters ? null : c.colorClusters,
      mainMarkerSize: c.mainMarkerSize === DEFAULT_CONFIG.mainMarkerSize ? null : c.mainMarkerSize,
      selectedMainMarkerSize: c.selectedMainMarkerSize === DEFAULT_CONFIG.selectedMainMarkerSize ? null : c.selectedMainMarkerSize,
      mainClusterSize: c.mainClusterSize === DEFAULT_CONFIG.mainClusterSize ? null : c.mainClusterSize,
      commonMarkerSize: c.commonMarkerSize === DEFAULT_CONFIG.commonMarkerSize ? null : c.commonMarkerSize,
      departureArrivalMarkerSize: c.departureArrivalMarkerSize === DEFAULT_CONFIG.departureArrivalMarkerSize ? null : c.departureArrivalMarkerSize,
      pointReferenceMarkerSize: c.pointReferenceMarkerSize === DEFAULT_CONFIG.pointReferenceMarkerSize ? null : c.pointReferenceMarkerSize,
      theme: c.theme === DEFAULT_CONFIG.theme || c.theme === 'purple' ? null : c.theme, // Default theme is purple so no need to put in URL if purple
    };

    // Optimization: If a specific theme is selected (not custom), we don't need to put colors in the URL
    // as they are defined by the theme.
    if (c.theme && c.theme !== 'custom') {
      const colorKeys = [
        'colorPrimaryApp', 'colorPrimary', 'colorOnPrimary', 'colorSurface', 'colorOnSurface',
        'colorSurfaceVariant', 'colorOnSurfaceVariant', 'colorPrimaryContainer', 'colorOnPrimaryContainer',
        'colorSecondaryContainer', 'colorOnSecondaryContainer', 'colorBackground', 'colorSurfaceContainerHigh',
        'colorSurfaceContainerLow', 'fabBackgroundColor', 'fabColor',
        'colorTrekLine', 'colorSensitiveArea', 'colorOutdoorArea', 'colorMarkers', 'colorClusters'
      ];
      colorKeys.forEach(key => {
        queryParams[key] = null;
      });
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  openModal() {
    this.dialog.open(IntegrationModalComponent, {
      data: this.config(),
      width: '600px',
      maxWidth: '90vw'
    });
  }
}
