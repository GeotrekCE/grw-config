import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PlatformLocation } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GlobalConfig } from '../../models/config.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

type ViewportMode = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_WIDTHS: Record<ViewportMode, string> = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
};

@Component({
  selector: 'app-widget-preview',
  imports: [TranslatePipe, MatButtonToggleModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="preview-container">
      <div class="header">
        <h2 class="title">{{ 'PREVIEW.TITLE' | translate }}</h2>
        <mat-button-toggle-group
          [value]="viewportMode()"
          (change)="viewportMode.set($event.value)"
          aria-label="Viewport mode"
          class="viewport-toggle">
          <mat-button-toggle value="mobile" [matTooltip]="'PREVIEW.MOBILE' | translate">
            <mat-icon>smartphone</mat-icon>
          </mat-button-toggle>
          <mat-button-toggle value="tablet" [matTooltip]="'PREVIEW.TABLET' | translate">
            <mat-icon>tablet_android</mat-icon>
          </mat-button-toggle>
          <mat-button-toggle value="desktop" [matTooltip]="'PREVIEW.DESKTOP' | translate">
            <mat-icon>desktop_windows</mat-icon>
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>
      <div class="display-area">
        @if (iframeSrc()) {
          <div class="iframe-wrapper" [class.framed]="viewportMode() !== 'desktop'" [style.max-width]="iframeMaxWidth()">
            <iframe [src]="iframeSrc()" class="widget-iframe" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
          </div>
        } @else {
          <div class="placeholder">{{ 'PREVIEW.GENERATING' | translate }}</div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .preview-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .header {
      background-color: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 0.75rem 1rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
      margin: 0;
    }
    .viewport-toggle {
      flex-shrink: 0;
    }
    .display-area {
      flex: 1;
      background-color: #f3f4f6;
      display: flex;
      justify-content: center;
      overflow: hidden;
      padding: 0;
      position: relative;
    }
    .iframe-wrapper {
      width: 100%;
      height: 100%;
      transition: max-width 0.3s ease-in-out;
    }
    .iframe-wrapper.framed {
      margin: 1rem auto;
      height: calc(100% - 2rem);
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
      overflow: hidden;
    }
    .placeholder {
      margin: auto;
      color: #9ca3af;
    }
    .widget-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetPreviewComponent {
  config = input.required<GlobalConfig>();

  private sanitizer = inject(DomSanitizer);
  private platformLocation = inject(PlatformLocation);

  iframeSrc = signal<SafeResourceUrl | null>(null);
  viewportMode = signal<ViewportMode>('desktop');

  iframeMaxWidth = () => VIEWPORT_WIDTHS[this.viewportMode()];

  private reloadTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect((onCleanup) => {
      const currentConfig = this.config();

      clearTimeout(this.reloadTimer);

      this.reloadTimer = setTimeout(() => {
        this.generateIframeUrl(currentConfig);
      }, 300); // Debounce iframe generation

      onCleanup(() => clearTimeout(this.reloadTimer));
    });
  }

  private generateIframeUrl(c: GlobalConfig) {
    const params = new URLSearchParams();

    params.set('api', c.api);
    params.set('languages', c.language);

    if (c.districts?.length) params.set('districts', c.districts.join(','));
    if (c.themes?.length) params.set('themes', c.themes.join(','));
    if (c.practices?.length) params.set('practices', c.practices.join(','));
    if (c.city?.length) params.set('cities', c.city.join(','));
    if (c.structure?.length) params.set('structures', c.structure.join(','));
    if (c.inBbox) params.set('inBbox', c.inBbox);
    if (c.portals?.length) params.set('portals', c.portals.join(','));
    if (c.routes?.length) params.set('routes', c.routes.join(','));
    if (c.labels?.length) params.set('labels', c.labels.join(','));

    if (c.treks !== undefined) params.set('treks', String(c.treks));
    if (c.touristicContents !== undefined) params.set('touristicContents', String(c.touristicContents));
    if (c.touristicEvents !== undefined) params.set('touristicEvents', String(c.touristicEvents));
    if (c.outdoor !== undefined) params.set('outdoor', String(c.outdoor));

    if (c.colorPrimaryContainer) params.set('color-primary-container', c.colorPrimaryContainer);
    if (c.colorPrimaryApp) params.set('color-primary-app', c.colorPrimaryApp);
    if (c.colorPrimary) params.set('color-primary', c.colorPrimary);
    if (c.colorOnPrimary) params.set('color-on-primary', c.colorOnPrimary);
    if (c.colorSurface) params.set('color-surface', c.colorSurface);
    if (c.colorOnSurface) params.set('color-on-surface', c.colorOnSurface);
    if (c.colorSurfaceVariant) params.set('color-surface-variant', c.colorSurfaceVariant);
    if (c.colorOnSurfaceVariant) params.set('color-on-surface-variant', c.colorOnSurfaceVariant);
    if (c.colorOnPrimaryContainer) params.set('color-on-primary-container', c.colorOnPrimaryContainer);
    if (c.colorSecondaryContainer) params.set('color-secondary-container', c.colorSecondaryContainer);
    if (c.colorOnSecondaryContainer) params.set('color-on-secondary-container', c.colorOnSecondaryContainer);
    if (c.colorBackground) params.set('color-background', c.colorBackground);
    if (c.colorSurfaceContainerHigh) params.set('color-surface-container-high', c.colorSurfaceContainerHigh);
    if (c.colorSurfaceContainerLow) params.set('color-surface-container-low', c.colorSurfaceContainerLow);
    if (c.fabBackgroundColor) params.set('fab-background-color', c.fabBackgroundColor);
    if (c.fabColor) params.set('fab-color', c.fabColor);
    if (c.rounded !== undefined) params.set('rounded', String(c.rounded));

    if (c.nameLayer) params.set('name-layer', c.nameLayer);
    if (c.urlLayer) params.set('url-layer', c.urlLayer);
    if (c.attributionLayer) params.set('attribution-layer', c.attributionLayer);

    // Map
    if (c.colorTrekLine) params.set('color-trek-line', c.colorTrekLine);
    if (c.colorSensitiveArea) params.set('color-sensitive-area', c.colorSensitiveArea);
    if (c.colorOutdoorArea) params.set('color-outdoor-area', c.colorOutdoorArea);
    if (c.colorMarkers) params.set('color-markers', c.colorMarkers);
    if (c.colorClusters) params.set('color-clusters', c.colorClusters);
    if (c.mainMarkerSize !== undefined) params.set('main-marker-size', String(c.mainMarkerSize));
    if (c.selectedMainMarkerSize !== undefined) params.set('selected-main-marker-size', String(c.selectedMainMarkerSize));
    if (c.mainClusterSize !== undefined) params.set('main-cluster-size', String(c.mainClusterSize));
    if (c.commonMarkerSize !== undefined) params.set('common-marker-size', String(c.commonMarkerSize));
    if (c.departureArrivalMarkerSize !== undefined) params.set('departure-arrival-marker-size', String(c.departureArrivalMarkerSize));
    if (c.pointReferenceMarkerSize !== undefined) params.set('point-reference-marker-size', String(c.pointReferenceMarkerSize));

    // Cache busting
    params.set('_v', Date.now().toString());

    // Use full URL or path. Since we are in same app, path is fine.
    // Note: sanitization is required for iframe src.
    const url = `${this.platformLocation.getBaseHrefFromDOM()}#/preview?${params.toString()}`;

    // Force reload by clearing the iframe src first
    this.iframeSrc.set(null);
    setTimeout(() => {
      this.iframeSrc.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
    }, 0);
  }
}
