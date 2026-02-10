import { ChangeDetectionStrategy, Component, effect, inject, input, output, ViewChild, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, startWith, map, distinctUntilChanged, filter, debounceTime } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { DEFAULT_CONFIG, GlobalConfig } from '../../models/config.model';
import { THEMES } from '../../models/themes.model';
import { GeotrekService } from '../../services/geotrek.service';
import { ActivatedRoute } from '@angular/router';

import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-config-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatSnackBarModule,
    LanguageSelectorComponent,
    TranslatePipe
  ],
  template: `
    <div class="config-container">
      <div class="header">
        <h2 class="title">{{ 'APP.TITLE' | translate }}</h2>
        <div class="flex items-center gap-2">
            <app-language-selector></app-language-selector>
            <button mat-icon-button (click)="resetForm()" [disabled]="isDefaultConfig()" [attr.aria-label]="'HEADER.RESET_LABEL' | translate" [attr.title]="'HEADER.RESET_TITLE' | translate">
                <mat-icon>refresh</mat-icon>
            </button>
            <button mat-icon-button (click)="shareConfig()" [attr.aria-label]="'HEADER.SHARE_LABEL' | translate" [attr.title]="'HEADER.SHARE_TITLE' | translate">
                <mat-icon>share</mat-icon>
            </button>
        </div>
      </div>
      
      <form [formGroup]="configForm" class="config-form">
        <mat-tab-group animationDuration="0ms" class="flex-1">
          <!-- General Tab -->
          <mat-tab [label]="'TABS.GENERAL' | translate">
            <div class="tab-content">
              <!-- API URL -->
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>{{ 'FIELDS.API_URL' | translate }}</mat-label>
                <input matInput formControlName="api" placeholder="https://.../api/v2/">
                @if (configForm.controls.api.errors?.['required']) {
                  <mat-error>{{ 'ERRORS.URL_REQUIRED' | translate }}</mat-error>
                }
                @if (configForm.controls.api.errors?.['pattern']) {
                  <mat-error>{{ 'ERRORS.URL_PATTERN' | translate }}</mat-error>
                }
              </mat-form-field>

              <!-- Language -->
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>{{ 'FIELDS.LANGUAGE' | translate }}</mat-label>
                <mat-select formControlName="language" multiple>
                  <mat-option value="fr">Français</mat-option>
                  <mat-option value="en">English</mat-option>
                  <mat-option value="es">Español</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Booleans -->
              <div class="flex flex-col gap-4 mt-4">
                <mat-slide-toggle formControlName="treks" color="primary">{{ 'FIELDS.TREKS' | translate }}</mat-slide-toggle>
                <mat-slide-toggle formControlName="outdoor" color="primary">{{ 'FIELDS.OUTDOOR' | translate }}</mat-slide-toggle>
                <mat-slide-toggle formControlName="touristicContents" color="primary">{{ 'FIELDS.TOURISTIC_CONTENTS' | translate }}</mat-slide-toggle>
                <mat-slide-toggle formControlName="touristicEvents" color="primary">{{ 'FIELDS.TOURISTIC_EVENTS' | translate }}</mat-slide-toggle>
              </div>
            </div>
          </mat-tab>

          <!-- Filters Tab -->
          <mat-tab [label]="'TABS.FILTERS' | translate" [disabled]="!isApiValid()">
            <div class="tab-content">
              <!-- Districts -->
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>{{ 'FIELDS.DISTRICTS' | translate }}</mat-label>
                <mat-select formControlName="districts" multiple [disabled]="districtsState().loading">
                  @for (item of districtsState().data; track item.id) {
                    <mat-option [value]="item.id">{{ item.name }}</mat-option>
                  }
                </mat-select>
                @if (districtsState().loading) {
                    <mat-spinner matSuffix [diameter]="20"></mat-spinner>
                }
              </mat-form-field>

              <!-- Themes -->
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>{{ 'FIELDS.THEMES' | translate }}</mat-label>
                <mat-select formControlName="themes" multiple [disabled]="themesState().loading">
                  @for (item of themesState().data; track item.id) {
                    <mat-option [value]="item.id">{{ item.label[currentLanguage() ?? 'fr'] }}</mat-option>
                  }
                </mat-select>
                @if (themesState().loading) {
                    <mat-spinner matSuffix [diameter]="20"></mat-spinner>
                }
              </mat-form-field>

              <!-- Practices -->
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>{{ 'FIELDS.PRACTICES' | translate }}</mat-label>
                <mat-select formControlName="practices" multiple [disabled]="practicesState().loading">
                  @for (item of practicesState().data; track item.id) {
                    <mat-option [value]="item.id">{{ item.name[currentLanguage() ?? 'fr'] }}</mat-option>
                  }
                </mat-select>
                @if (practicesState().loading) {
                    <mat-spinner matSuffix [diameter]="20"></mat-spinner>
                }
              </mat-form-field>

              <!-- Cities -->
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>{{ 'FIELDS.CITIES' | translate }}</mat-label>
                <mat-select formControlName="city" multiple [disabled]="citiesState().loading">
                  @for (item of citiesState().data; track item.id) {
                    <mat-option [value]="item.id">{{ item.name }}</mat-option>
                  }
                </mat-select>
                @if (citiesState().loading) {
                    <mat-spinner matSuffix [diameter]="20"></mat-spinner>
                }
              </mat-form-field>

              <!-- Structures -->
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>{{ 'FIELDS.STRUCTURES' | translate }}</mat-label>
                <mat-select formControlName="structure" multiple [disabled]="structuresState().loading">
                  @for (item of structuresState().data; track item.id) {
                    <mat-option [value]="item.id">{{ item.name }}</mat-option>
                  }
                </mat-select>
                @if (structuresState().loading) {
                    <mat-spinner matSuffix [diameter]="20"></mat-spinner>
                }
              </mat-form-field>
              
              <!-- Portals -->
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>{{ 'FIELDS.PORTALS' | translate }}</mat-label>
                <mat-select formControlName="portals" multiple [disabled]="portalsState().loading">
                  @for (item of portalsState().data; track item.id) {
                    <mat-option [value]="item.id">{{ item.name }}</mat-option>
                  }
                </mat-select>
                @if (portalsState().loading) {
                    <mat-spinner matSuffix [diameter]="20"></mat-spinner>
                }
              </mat-form-field>
              
               <!-- Routes -->
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>{{ 'FIELDS.ROUTES' | translate }}</mat-label>
                <mat-select formControlName="routes" multiple [disabled]="routesState().loading">
                  @for (item of routesState().data; track item.id) {
                    <mat-option [value]="item.id">{{ item.route[currentLanguage() ?? 'fr'] }}</mat-option>
                  }
                </mat-select>
                @if (routesState().loading) {
                    <mat-spinner matSuffix [diameter]="20"></mat-spinner>
                }
              </mat-form-field>
              
               <!-- Labels -->
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>{{ 'FIELDS.LABELS' | translate }}</mat-label>
                <mat-select formControlName="labels" multiple [disabled]="labelsState().loading">
                  @for (item of labelsState().data; track item.id) {
                    <mat-option [value]="item.id">{{ item.name[currentLanguage() ?? 'fr'] }}</mat-option>
                  }
                </mat-select>
                @if (labelsState().loading) {
                    <mat-spinner matSuffix [diameter]="20"></mat-spinner>
                }
              </mat-form-field>

              <!-- In Bbox -->
              <mat-form-field appearance="fill" class="w-full">
                 <mat-label>{{ 'FIELDS.IN_BBOX' | translate }}</mat-label>
                 <input matInput formControlName="inBbox" placeholder="minLon,minLat,maxLon,maxLat">
              </mat-form-field>
            </div>
          </mat-tab>

          <!-- Appearance Tab -->
          <mat-tab [label]="'TABS.APPEARANCE' | translate" [disabled]="!isApiValid()">
            <div class="tab-content">
              <div class="mb-4">
                  <mat-slide-toggle formControlName="rounded" color="primary">{{ 'FIELDS.ROUNDED' | translate }}</mat-slide-toggle>
              </div>
              <label class="block mb-2 text-sm font-medium text-gray-700">{{ 'COLORS.THEME_TITLE' | translate }}</label>
              <mat-form-field appearance="fill" class="w-full mb-4">
                <mat-label>{{ 'COLORS.THEME_SELECT' | translate }}</mat-label>
                <mat-select [formControl]="themeControl">
                  @for (theme of themes; track theme.value) {
                    <mat-option [value]="theme.value">{{ 'COLORS.THEME_LABELS.' + theme.value.toUpperCase() | translate }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <div class="mb-4">
                  <button mat-stroked-button (click)="showAdvancedColors.set(!showAdvancedColors())" type="button">
                      <mat-icon>{{ showAdvancedColors() ? 'expand_less' : 'expand_more' }}</mat-icon>
                      {{ (showAdvancedColors() ? 'COLORS.HIDE_ADVANCED' : 'COLORS.SHOW_ADVANCED') | translate }}
                  </button>
              </div>

              @if (showAdvancedColors()) {
              <label class="block mb-2 text-sm font-medium text-gray-700">{{ 'COLORS.COLORS_TITLE' | translate }}</label>
              <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.PRIMARY_APP' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorPrimaryApp" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorPrimaryApp')?.value }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.PRIMARY' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorPrimary" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorPrimary')?.value }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.ON_PRIMARY' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorOnPrimary" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorOnPrimary')?.value }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.PRIMARY_CONTAINER' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorPrimaryContainer" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorPrimaryContainer')?.value }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.ON_PRIMARY_CONTAINER' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorOnPrimaryContainer" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorOnPrimaryContainer')?.value }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.SECONDARY_CONTAINER' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorSecondaryContainer" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorSecondaryContainer')?.value }}</span>
                    </div>
                  </div>
                   <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.ON_SECONDARY_CONTAINER' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorOnSecondaryContainer" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorOnSecondaryContainer')?.value }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.BACKGROUND' | translate }}</label>
                     <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorBackground" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorBackground')?.value }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.SURFACE' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorSurface" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorSurface')?.value }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.ON_SURFACE' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorOnSurface" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorOnSurface')?.value }}</span>
                    </div>
                  </div>
                   <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.SURFACE_VARIANT' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorSurfaceVariant" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorSurfaceVariant')?.value }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.ON_SURFACE_VARIANT' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorOnSurfaceVariant" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorOnSurfaceVariant')?.value }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.SURFACE_CONTAINER_HIGH' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorSurfaceContainerHigh" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorSurfaceContainerHigh')?.value }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.SURFACE_CONTAINER_LOW' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorSurfaceContainerLow" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorSurfaceContainerLow')?.value }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.FAB_BACKGROUND' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="fabBackgroundColor" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('fabBackgroundColor')?.value }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.FAB_COLOR' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="fabColor" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('fabColor')?.value }}</span>
                    </div>
                  </div>
              </div>

              <label class="block mb-2 text-sm font-medium text-gray-700 mt-4">{{ 'COLORS.MAP_COLORS_TITLE' | translate }}</label>
              <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.TREK_LINE' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorTrekLine" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorTrekLine')?.value }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.SENSITIVE_AREA' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorSensitiveArea" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorSensitiveArea')?.value }}</span>
                    </div>
                  </div>
                   <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.OUTDOOR_AREA' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorOutdoorArea" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorOutdoorArea')?.value }}</span>
                    </div>
                  </div>
                   <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.MARKERS' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorMarkers" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorMarkers')?.value }}</span>
                    </div>
                  </div>
                   <div>
                    <label class="text-xs text-gray-500">{{ 'COLORS.CLUSTERS' | translate }}</label>
                    <div class="flex items-center gap-2">
                        <input type="color" formControlName="colorClusters" class="h-8 w-14 cursor-pointer rounded border border-gray-300 p-1">
                        <span class="font-mono text-xs">{{ configForm.get('colorClusters')?.value }}</span>
                    </div>
                  </div>
              </div>
              }


            </div>
          </mat-tab>

          <!-- Map Tab -->
          <mat-tab [label]="'TABS.MAP' | translate" [disabled]="!isApiValid()">
            <div class="tab-content">
              <!-- Layer Name -->
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>{{ 'FIELDS.LAYER_NAME' | translate }}</mat-label>
                <input matInput formControlName="nameLayer" placeholder="IGN">
                <mat-icon matSuffix [matTooltip]="'FIELDS.LAYER_NAME_TOOLTIP' | translate" matTooltipClass="multiline-tooltip" class="help-icon">help_outline</mat-icon>
              </mat-form-field>

              <!-- Layer URL -->
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>{{ 'FIELDS.LAYER_URL' | translate }}</mat-label>
                <input matInput formControlName="urlLayer" placeholder="https://...">
                <mat-icon matSuffix [matTooltip]="'FIELDS.LAYER_URL_TOOLTIP' | translate" matTooltipClass="multiline-tooltip" class="help-icon">help_outline</mat-icon>
              </mat-form-field>

              <!-- Attribution -->
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>{{ 'FIELDS.ATTRIBUTION' | translate }}</mat-label>
                <input matInput formControlName="attributionLayer" placeholder="<a href...>">
                <mat-icon matSuffix [matTooltip]="'FIELDS.ATTRIBUTION_TOOLTIP' | translate" matTooltipClass="multiline-tooltip" class="help-icon">help_outline</mat-icon>
              </mat-form-field>



               <label class="block mb-2 text-sm font-medium text-gray-700 mt-4">{{ 'COLORS.SIZES_TITLE' | translate }}</label>
               <div class="grid grid-cols-2 gap-4">
                  <mat-form-field appearance="fill" class="w-full">
                    <mat-label>{{ 'FIELDS.MAIN_MARKER' | translate }}</mat-label>
                    <input matInput type="number" formControlName="mainMarkerSize">
                  </mat-form-field>
                  <mat-form-field appearance="fill" class="w-full">
                    <mat-label>{{ 'FIELDS.SELECTED_MAIN_MARKER' | translate }}</mat-label>
                    <input matInput type="number" formControlName="selectedMainMarkerSize">
                  </mat-form-field>
                   <mat-form-field appearance="fill" class="w-full">
                    <mat-label>{{ 'FIELDS.MAIN_CLUSTER' | translate }}</mat-label>
                    <input matInput type="number" formControlName="mainClusterSize">
                  </mat-form-field>
                   <mat-form-field appearance="fill" class="w-full">
                    <mat-label>{{ 'FIELDS.COMMON_MARKER' | translate }}</mat-label>
                    <input matInput type="number" formControlName="commonMarkerSize">
                    <mat-icon matSuffix [matTooltip]="'FIELDS.COMMON_MARKER_TOOLTIP' | translate" matTooltipClass="multiline-tooltip" class="help-icon">help_outline</mat-icon>
                  </mat-form-field>
                   <mat-form-field appearance="fill" class="w-full">
                    <mat-label>{{ 'FIELDS.DEPARTURE_ARRIVAL' | translate }}</mat-label>
                    <input matInput type="number" formControlName="departureArrivalMarkerSize">
                  </mat-form-field>
                   <mat-form-field appearance="fill" class="w-full">
                    <mat-label>{{ 'FIELDS.POINT_REFERENCE' | translate }}</mat-label>
                    <input matInput type="number" formControlName="pointReferenceMarkerSize">
                  </mat-form-field>
               </div>
            </div>
          </mat-tab>
        </mat-tab-group>

        <div class="footer">
          <button mat-raised-button color="primary" 
                  (click)="generate.emit()" 
                  [disabled]="configForm.invalid"
                  class="w-full">
            {{ 'ACTIONS.GENERATE_CODE' | translate }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .config-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e0e0e0;
      background: #f5f5f5;
    }
    .title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
    }
    .config-form {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }
    mat-tab-group {
      flex: 1;
      overflow: hidden;
    }
    ::ng-deep .mat-mdc-tab-body-wrapper {
      height: 100%;
    }
    .tab-content {
      padding: 1.5rem;
      overflow-y: auto;
      height: 100%;
      box-sizing: border-box;
    }
    .footer {
      padding: 1rem;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }
    .w-full { width: 100%; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .gap-4 { gap: 1rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-4 { margin-top: 1rem; }
    .flex-col { flex-direction: column; }
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-gray-500 { color: #6b7280; }
    .gap-2 { gap: 0.5rem; }
    .help-icon { cursor: help; color: #9e9e9e; font-size: 20px; }
    ::ng-deep .multiline-tooltip { white-space: pre-line; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigFormComponent {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  themes = THEMES;
  themeControl = new FormControl('purple', { nonNullable: true });
  showAdvancedColors = signal(false);
  private isApplyingTheme = false;

  private geotrekService = inject(GeotrekService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private translationService = inject(TranslationService);
  configChange = output<GlobalConfig>();
  generate = output();

  configForm = new FormGroup({
    api: new FormControl(DEFAULT_CONFIG.api, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/.*\/api\/v2\/$/)]
    }),
    language: new FormControl<string[]>([DEFAULT_CONFIG.language], { nonNullable: true }),
    districts: new FormControl<number[]>(DEFAULT_CONFIG.districts ?? [], { nonNullable: true }),
    themes: new FormControl<number[]>([], { nonNullable: true }),
    practices: new FormControl<number[]>([], { nonNullable: true }),
    city: new FormControl<number[]>([], { nonNullable: true }),
    structure: new FormControl<number[]>([], { nonNullable: true }),

    // New Filters
    inBbox: new FormControl(DEFAULT_CONFIG.inBbox || '', { nonNullable: true }),
    portals: new FormControl<number[]>([], { nonNullable: true }),
    routes: new FormControl<number[]>([], { nonNullable: true }),
    labels: new FormControl<number[]>([], { nonNullable: true }),


    // Appearance
    colorPrimaryApp: new FormControl(DEFAULT_CONFIG.colorPrimaryApp || '#6750a4', { nonNullable: true }),
    colorPrimary: new FormControl(DEFAULT_CONFIG.colorPrimary || '#6750a4', { nonNullable: true }),
    colorOnPrimary: new FormControl(DEFAULT_CONFIG.colorOnPrimary || '#ffffff', { nonNullable: true }),
    colorSurface: new FormControl(DEFAULT_CONFIG.colorSurface || '#1c1b1f', { nonNullable: true }),
    colorOnSurface: new FormControl(DEFAULT_CONFIG.colorOnSurface || '#49454e', { nonNullable: true }),
    colorSurfaceVariant: new FormControl(DEFAULT_CONFIG.colorSurfaceVariant || '#fef7ff', { nonNullable: true }),
    colorOnSurfaceVariant: new FormControl(DEFAULT_CONFIG.colorOnSurfaceVariant || '#1c1b1f', { nonNullable: true }),
    colorPrimaryContainer: new FormControl(DEFAULT_CONFIG.colorPrimaryContainer || '#eaddff', { nonNullable: true }), // Updated default from model
    colorOnPrimaryContainer: new FormControl(DEFAULT_CONFIG.colorOnPrimaryContainer || '#21005e', { nonNullable: true }),
    colorSecondaryContainer: new FormControl(DEFAULT_CONFIG.colorSecondaryContainer || '#e8def8', { nonNullable: true }),
    colorOnSecondaryContainer: new FormControl(DEFAULT_CONFIG.colorOnSecondaryContainer || '#1d192b', { nonNullable: true }),
    colorBackground: new FormControl(DEFAULT_CONFIG.colorBackground || '#fef7ff', { nonNullable: true }),
    colorSurfaceContainerHigh: new FormControl(DEFAULT_CONFIG.colorSurfaceContainerHigh || '#ece6f0', { nonNullable: true }),
    colorSurfaceContainerLow: new FormControl(DEFAULT_CONFIG.colorSurfaceContainerLow || '#f7f2fa', { nonNullable: true }),
    fabBackgroundColor: new FormControl(DEFAULT_CONFIG.fabBackgroundColor || '#eaddff', { nonNullable: true }),
    fabColor: new FormControl(DEFAULT_CONFIG.fabColor || '#21005d', { nonNullable: true }),
    rounded: new FormControl(DEFAULT_CONFIG.rounded ?? true, { nonNullable: true }),

    nameLayer: new FormControl(DEFAULT_CONFIG.nameLayer || 'IGN', { nonNullable: true }),
    urlLayer: new FormControl(DEFAULT_CONFIG.urlLayer || '', { nonNullable: true }),
    attributionLayer: new FormControl(DEFAULT_CONFIG.attributionLayer || '', { nonNullable: true }),
    treks: new FormControl(DEFAULT_CONFIG.treks ?? true, { nonNullable: true }),
    touristicContents: new FormControl(DEFAULT_CONFIG.touristicContents ?? false, { nonNullable: true }),
    touristicEvents: new FormControl(DEFAULT_CONFIG.touristicEvents ?? false, { nonNullable: true }),
    outdoor: new FormControl(DEFAULT_CONFIG.outdoor ?? false, { nonNullable: true }),

    // Map
    colorTrekLine: new FormControl(DEFAULT_CONFIG.colorTrekLine || '#6b0030', { nonNullable: true }),
    colorSensitiveArea: new FormControl(DEFAULT_CONFIG.colorSensitiveArea || '#4974a5', { nonNullable: true }),
    colorOutdoorArea: new FormControl(DEFAULT_CONFIG.colorOutdoorArea || '#ffb700', { nonNullable: true }),
    colorMarkers: new FormControl(DEFAULT_CONFIG.colorMarkers || '#6750a4', { nonNullable: true }),
    colorClusters: new FormControl(DEFAULT_CONFIG.colorClusters || '#6750a4', { nonNullable: true }),

    mainMarkerSize: new FormControl(DEFAULT_CONFIG.mainMarkerSize || 32, { nonNullable: true }),
    selectedMainMarkerSize: new FormControl(DEFAULT_CONFIG.selectedMainMarkerSize || 48, { nonNullable: true }),
    mainClusterSize: new FormControl(DEFAULT_CONFIG.mainClusterSize || 48, { nonNullable: true }),
    commonMarkerSize: new FormControl(DEFAULT_CONFIG.commonMarkerSize || 48, { nonNullable: true }),
    departureArrivalMarkerSize: new FormControl(DEFAULT_CONFIG.departureArrivalMarkerSize || 14, { nonNullable: true }),
    pointReferenceMarkerSize: new FormControl(DEFAULT_CONFIG.pointReferenceMarkerSize || 24, { nonNullable: true }),
  });

  private createResourceSignal(method: (url: string) => Observable<any>) {
    return toSignal(
      this.configForm.controls.api.valueChanges.pipe(
        startWith(this.configForm.controls.api.value),
        debounceTime(300),
        map(url => url?.trim()),
        distinctUntilChanged(),
        filter(url => !!url && url.endsWith('/api/v2/')),
        switchMap(url => method.call(this.geotrekService, url).pipe(
          map(response => ({ loading: false, data: response.results as any[] })),
          startWith({ loading: true, data: [] })
        ))
      ),
      { initialValue: { loading: false, data: [] } }
    );
  }

  districtsState = this.createResourceSignal(this.geotrekService.getDistricts);
  themesState = this.createResourceSignal(this.geotrekService.getThemes);
  practicesState = this.createResourceSignal(this.geotrekService.getPractices);
  citiesState = this.createResourceSignal(this.geotrekService.getCities);
  structuresState = this.createResourceSignal(this.geotrekService.getStructures);
  portalsState = this.createResourceSignal(this.geotrekService.getPortals);
  routesState = this.createResourceSignal(this.geotrekService.getRoutes);
  labelsState = this.createResourceSignal(this.geotrekService.getLabels);

  currentLanguage = toSignal(
    this.configForm.controls.language.valueChanges.pipe(
      startWith(this.configForm.controls.language.value),
      map(languages => languages && languages.length > 0 ? languages[0] : 'fr')
    )
  );

  initialConfig = input<GlobalConfig>();

  isApiValid = toSignal(
    this.configForm.controls.api.statusChanges.pipe(
      map(status => status === 'VALID'),
      startWith(this.configForm.controls.api.valid)
    ),
    { initialValue: true }
  );

  isDefaultConfig = toSignal(
    combineLatest([
      this.configForm.valueChanges.pipe(startWith(this.configForm.value)),
      this.route.queryParams
    ]).pipe(
      map(([formValue, params]: [any, any]) => {
        // Check if form values match DEFAULT_CONFIG
        const isFormDefault = Object.keys(formValue).every(key => {
          const currentValue = formValue[key];
          const defaultValue = (DEFAULT_CONFIG as any)[key];

          // Handle language specifically since form has array but default config has string
          if (key === 'language') {
            const defaultLang = defaultValue;
            return Array.isArray(currentValue) && currentValue.length === 1 && currentValue[0] === defaultLang;
          }

          // Handle arrays (filters) - compare element-by-element against DEFAULT_CONFIG
          if (Array.isArray(currentValue)) {
            const defaultArray = Array.isArray(defaultValue) ? defaultValue : [];
            return currentValue.length === defaultArray.length &&
              currentValue.every((v: number) => defaultArray.includes(v));
          }

          // For optional strings like inBbox that default to undefined in model but '' in form
          if (defaultValue === undefined && currentValue === '') {
            return true;
          }
          return currentValue === defaultValue;
        });

        // Also check if there are any config params in the URL that shouldn't be there if default
        // (Though typically URL updates to match form)
        const configKeys = Object.keys(formValue);
        const hasConfigParams = configKeys.some(key => Object.prototype.hasOwnProperty.call(params, key));

        return isFormDefault && !hasConfigParams;
      })
    ),
    { initialValue: true }
  );

  constructor() {
    // Ensure at least the default language is always selected
    this.configForm.controls.language.valueChanges.subscribe(languages => {
      if (!languages || languages.length === 0) {
        this.configForm.controls.language.setValue([DEFAULT_CONFIG.language], { emitEvent: false });
      }
    });

    // Reset filters when API changes
    this.configForm.controls.api.valueChanges.subscribe(() => {
      this.configForm.patchValue({
        districts: [],
        themes: [],
        practices: [],
        structure: [],
        city: [],
        portals: [],
        routes: [],
        labels: [],
        inBbox: ''
      }, { emitEvent: false });
    });

    this.themeControl.valueChanges.subscribe(themeValue => {
      if (themeValue === 'custom') {
        this.showAdvancedColors.set(true);
      }
      const selectedTheme = this.themes.find(t => t.value === themeValue);
      if (selectedTheme && themeValue !== 'custom') {
        this.isApplyingTheme = true;
        this.configForm.patchValue(selectedTheme.colors as any);
        this.isApplyingTheme = false;
      }
    });

    const colorControls = [
      'colorPrimaryApp', 'colorPrimary', 'colorOnPrimary', 'colorSurface', 'colorOnSurface',
      'colorSurfaceVariant', 'colorOnSurfaceVariant', 'colorPrimaryContainer', 'colorOnPrimaryContainer',
      'colorSecondaryContainer', 'colorOnSecondaryContainer', 'colorBackground', 'colorSurfaceContainerHigh',
      'colorSurfaceContainerLow', 'fabBackgroundColor', 'fabColor',
      'colorTrekLine', 'colorSensitiveArea', 'colorOutdoorArea', 'colorMarkers', 'colorClusters'
    ];

    colorControls.forEach(controlName => {
      this.configForm.get(controlName)?.valueChanges.subscribe(() => {
        if (!this.isApplyingTheme && this.themeControl.value !== 'custom') {
          this.themeControl.setValue('custom', { emitEvent: false });
        }
      });
    });

    this.configForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe((value) => {
      if (this.configForm.valid) {
        this.configChange.emit({
          ...value,
          api: value.api?.trim(),
          language: (value.language as string[])?.join(','),
          theme: this.themeControl.value
        } as GlobalConfig);
      }
    });

    effect(() => {
      const config = this.initialConfig();
      if (config) {
        this.configForm.patchValue({
          api: config.api,
          language: config.language ? config.language.split(',') : ['fr'],
          districts: config.districts,
          themes: config.themes,
          practices: config.practices,
          structure: config.structure,
          city: config.city,
          inBbox: config.inBbox,
          portals: config.portals,
          routes: config.routes,
          labels: config.labels,

          colorPrimaryApp: config.colorPrimaryApp,
          colorPrimary: config.colorPrimary,
          colorOnPrimary: config.colorOnPrimary,
          colorSurface: config.colorSurface,
          colorOnSurface: config.colorOnSurface,
          colorSurfaceVariant: config.colorSurfaceVariant,
          colorOnSurfaceVariant: config.colorOnSurfaceVariant,

          colorOnPrimaryContainer: config.colorOnPrimaryContainer,
          colorSecondaryContainer: config.colorSecondaryContainer,
          colorOnSecondaryContainer: config.colorOnSecondaryContainer,
          colorBackground: config.colorBackground,
          colorSurfaceContainerHigh: config.colorSurfaceContainerHigh,
          colorSurfaceContainerLow: config.colorSurfaceContainerLow,
          fabBackgroundColor: config.fabBackgroundColor,
          fabColor: config.fabColor,
          rounded: config.rounded,

          nameLayer: config.nameLayer,
          urlLayer: config.urlLayer,
          attributionLayer: config.attributionLayer,
          treks: config.treks,
          touristicContents: config.touristicContents,
          touristicEvents: config.touristicEvents,
          outdoor: config.outdoor,

          colorTrekLine: config.colorTrekLine,
          colorSensitiveArea: config.colorSensitiveArea,
          colorOutdoorArea: config.colorOutdoorArea,
          colorMarkers: config.colorMarkers,
          colorClusters: config.colorClusters,
          mainMarkerSize: config.mainMarkerSize,
          selectedMainMarkerSize: config.selectedMainMarkerSize,
          mainClusterSize: config.mainClusterSize,
          commonMarkerSize: config.commonMarkerSize,
          departureArrivalMarkerSize: config.departureArrivalMarkerSize,
          pointReferenceMarkerSize: config.pointReferenceMarkerSize
        }, { emitEvent: false });

        if (config.theme) {
          this.themeControl.setValue(config.theme, { emitEvent: false });
          if (config.theme === 'custom') {
            this.showAdvancedColors.set(true);
          }
        }
      }
    });
  }

  resetForm() {
    this.isApplyingTheme = true;
    this.themeControl.setValue('purple', { emitEvent: false });

    // Reset api first without emitting to prevent the api valueChanges
    // subscriber from clearing filters (districts, themes, etc.)
    this.configForm.controls.api.setValue(DEFAULT_CONFIG.api, { emitEvent: false });

    this.configForm.reset({
      ...DEFAULT_CONFIG,
      language: [DEFAULT_CONFIG.language]
    });
    this.isApplyingTheme = false;

    if (this.tabGroup) {
      this.tabGroup.selectedIndex = 0;
    }
  }

  shareConfig() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'GRW Config',
        url: url
      }).catch((error) => {
        console.error('Error sharing:', error);
        // Fallback to clipboard if share fails (e.g. user cancelled)
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open(this.translationService.translate('MESSAGES.LINK_COPIED'), this.translationService.translate('ACTIONS.CLOSE'), {
          duration: 3000
        });
      }).catch(err => {
        console.error('Could not copy text: ', err);
        this.snackBar.open(this.translationService.translate('MESSAGES.SHARE_ERROR'), this.translationService.translate('ACTIONS.CLOSE'), {
          duration: 3000
        });
      });
    }
  }
}
