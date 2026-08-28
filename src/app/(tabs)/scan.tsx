import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Screen } from '@/components/screen';
import { Tag } from '@/components/tag';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT, type Translator } from '@/i18n';
import type { UIKey } from '@/i18n/ui/en';
import { lookupBarcode, type LookupResult, type Product } from '@/lib/food-facts';
import { ketoVerdict, type Verdict, type VerdictResult } from '@/lib/keto-verdict';
import { useApp } from '@/store/app-provider';

/**
 * The barcode symbologies actually printed on food packaging. Listing them
 * rather than accepting everything keeps the camera from locking onto a QR code
 * on the same label and reporting a URL as a product.
 */
const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] as const;

type ScanState =
  | { phase: 'scanning' }
  | { phase: 'looking'; barcode: string }
  | { phase: 'result'; product: Product; verdict: VerdictResult }
  | { phase: 'miss'; result: Exclude<LookupResult['status'], 'found'> };

export default function ScanScreen() {
  const t = useT();
  const theme = useTheme();
  const { preferences } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ScanState>({ phase: 'scanning' });

  /**
   * The camera fires this many times a second while a barcode is in frame.
   * A ref rather than state because the guard has to hold within a single
   * frame, before React has had a chance to re-render.
   */
  const busy = useRef(false);

  const onScanned = useCallback(
    async ({ data }: BarcodeScanningResult) => {
      if (busy.current) return;
      busy.current = true;

      if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setState({ phase: 'looking', barcode: data });

      const result = await lookupBarcode(data);
      if (result.status === 'found') {
        setState({
          phase: 'result',
          product: result.product,
          verdict: ketoVerdict(
            result.product.nutrition,
            preferences.netCarbLimit,
            result.product.ingredients
          ),
        });
      } else {
        setState({ phase: 'miss', result: result.status });
      }
    },
    [preferences.netCarbLimit]
  );

  const reset = useCallback(() => {
    busy.current = false;
    setState({ phase: 'scanning' });
  }, []);

  // Permission state is null for the first frame while expo-camera reads it.
  // Rendering the empty page avoids a flash of the "allow camera" prompt at
  // people who granted it long ago.
  if (!permission) return <Screen><View /></Screen>;

  if (!permission.granted) {
    return (
      <Screen>
        <View style={styles.centred}>
          <Ionicons name="camera-outline" size={44} color={theme.textMuted} />
          <ThemedText style={styles.permissionTitle}>{t('scan.permissionTitle')}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.permissionBody}>
            {permission.canAskAgain ? t('scan.permissionBody') : t('scan.permissionDenied')}
          </ThemedText>
          {permission.canAskAgain && (
            <Pressable
              accessibilityRole="button"
              onPress={requestPermission}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.accent },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={[styles.primaryLabel, { color: theme.accentText }]}>
                {t('scan.permissionButton')}
              </ThemedText>
            </Pressable>
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{t('scan.title')}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {t('scan.subtitle')}
          </ThemedText>
        </View>

        {/* The viewfinder shrinks once there is something to read below it: a
            full-height black rectangle above a result is 260 points spent on
            nothing. */}
        <View
          style={[
            styles.viewfinder,
            state.phase !== 'scanning' && styles.viewfinderSmall,
            { backgroundColor: theme.inverseSurface },
          ]}>
          {state.phase === 'scanning' ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
              onBarcodeScanned={onScanned}
            />
          ) : (
            <View style={styles.viewfinderIdle}>
              {state.phase === 'looking' ? (
                <>
                  <ActivityIndicator color={theme.inverseText} />
                  <ThemedText style={[styles.viewfinderText, { color: theme.inverseText }]}>
                    {t('scan.looking')}
                  </ThemedText>
                </>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={reset}
                  style={({ pressed }) => [styles.scanAgain, pressed && styles.pressed]}>
                  <Ionicons name="scan-outline" size={22} color={theme.inverseText} />
                  <ThemedText style={[styles.viewfinderText, { color: theme.inverseText }]}>
                    {t('scan.scanAgain')}
                  </ThemedText>
                </Pressable>
              )}
            </View>
          )}

          {state.phase === 'scanning' && (
            <View pointerEvents="none" style={styles.reticle}>
              <View style={[styles.reticleBox, { borderColor: theme.inverseText }]} />
              <ThemedText style={[styles.reticleHint, { color: theme.inverseText }]}>
                {t('scan.aim')}
              </ThemedText>
            </View>
          )}
        </View>

        {state.phase === 'result' && <ResultCard product={state.product} verdict={state.verdict} t={t} />}
        {state.phase === 'miss' && <MissCard status={state.result} t={t} />}

        <ThemedText themeColor="textMuted" style={styles.disclaimer}>
          {t('scan.disclaimer')}
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

/** Which palette entry and glyph each verdict wears. */
const VERDICT_STYLE: Record<
  Verdict,
  { color: ThemeColor; icon: React.ComponentProps<typeof Ionicons>['name']; label: UIKey }
> = {
  keto: { color: 'accent', icon: 'checkmark-circle', label: 'scan.verdictKeto' },
  borderline: { color: 'fat', icon: 'alert-circle', label: 'scan.verdictBorderline' },
  avoid: { color: 'danger', icon: 'close-circle', label: 'scan.verdictAvoid' },
  unknown: { color: 'textMuted', icon: 'help-circle', label: 'scan.verdictUnknown' },
};

const REASON_COLOR = { good: 'accent', warn: 'fat', bad: 'danger' } as const;

function ResultCard({ product, verdict, t }: { product: Product; verdict: VerdictResult; t: Translator }) {
  const theme = useTheme();
  const style = VERDICT_STYLE[verdict.verdict];

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.productRow}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.thumb} resizeMode="contain" />
        ) : (
          <View style={[styles.thumb, styles.thumbEmpty, { backgroundColor: theme.surfaceAlt }]}>
            <Ionicons name="cube-outline" size={22} color={theme.textMuted} />
          </View>
        )}

        <View style={styles.productText}>
          <ThemedText style={styles.productName} numberOfLines={2}>
            {product.name ?? product.barcode}
          </ThemedText>
          {(product.brand ?? product.quantity) && (
            <ThemedText themeColor="textSecondary" style={styles.productMeta} numberOfLines={1}>
              {[product.brand, product.quantity].filter(Boolean).join(' · ')}
            </ThemedText>
          )}
        </View>
      </View>

      <View style={[styles.verdictRow, { backgroundColor: theme.surfaceAlt }]}>
        <Ionicons name={style.icon} size={26} color={theme[style.color]} />
        <ThemedText style={[styles.verdictLabel, { color: theme[style.color] }]}>
          {t(style.label)}
        </ThemedText>
      </View>

      <View style={styles.figures}>
        <Figure
          label={t('scan.per100g')}
          value={verdict.carbs100g === undefined ? '—' : t('card.netCarbsValue', { count: verdict.carbs100g })}
        />
        {verdict.carbsPerServing !== undefined && (
          <Figure
            label={t('scan.perServing')}
            value={t('card.netCarbsValue', { count: verdict.carbsPerServing })}
            note={
              product.nutrition.servingGrams
                ? t('scan.servingOf', { count: product.nutrition.servingGrams })
                : undefined
            }
          />
        )}
      </View>

      <View style={styles.reasons}>
        <ThemedText themeColor="textMuted" style={styles.reasonsTitle}>
          {t('scan.whyTitle')}
        </ThemedText>
        {verdict.reasons.map((reason) => (
          <View key={reason.key} style={styles.reason}>
            <Ionicons
              name={reason.tone === 'good' ? 'checkmark' : reason.tone === 'warn' ? 'remove' : 'close'}
              size={15}
              color={theme[REASON_COLOR[reason.tone]]}
            />
            <ThemedText themeColor="textSecondary" style={styles.reasonText}>
              {t(reason.key, reason.params)}
            </ThemedText>
          </View>
        ))}
      </View>

      <Tag label={t('scan.source')} color="textMuted" icon="globe-outline" />
    </View>
  );
}

const MISS_COPY = {
  'not-found': { icon: 'search-outline', title: 'scan.notFoundTitle', body: 'scan.notFoundBody' },
  offline: { icon: 'cloud-offline-outline', title: 'scan.offlineTitle', body: 'scan.offlineBody' },
  error: { icon: 'warning-outline', title: 'scan.errorTitle', body: 'scan.errorBody' },
} as const;

function MissCard({ status, t }: { status: keyof typeof MISS_COPY; t: Translator }) {
  const theme = useTheme();
  const copy = MISS_COPY[status];

  return (
    <View style={[styles.card, styles.missCard, { backgroundColor: theme.surface }]}>
      <Ionicons name={copy.icon} size={30} color={theme.textMuted} />
      <ThemedText style={styles.missTitle}>{t(copy.title)}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.missBody}>
        {t(copy.body)}
      </ThemedText>
    </View>
  );
}

function Figure({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <View style={styles.figure}>
      <ThemedText themeColor="textMuted" style={styles.figureLabel}>
        {label}
      </ThemedText>
      <ThemedText style={styles.figureValue}>{value}</ThemedText>
      {note && (
        <ThemedText themeColor="textMuted" style={styles.figureNote}>
          {note}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.four,
  },
  header: { gap: 2 },
  title: { fontSize: 27, lineHeight: 33, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  viewfinder: {
    height: 260,
    borderRadius: Radius.xlarge,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  viewfinderSmall: { height: 132 },
  viewfinderIdle: { alignItems: 'center', justifyContent: 'center', gap: Spacing.two, flex: 1 },
  viewfinderText: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  scanAgain: { alignItems: 'center', gap: Spacing.two, padding: Spacing.three },
  reticle: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  reticleBox: {
    width: '70%',
    height: 108,
    borderRadius: Radius.medium,
    borderWidth: 2,
    opacity: 0.9,
  },
  reticleHint: { fontSize: 12, lineHeight: 16, fontWeight: '700', textAlign: 'center' },
  card: { borderRadius: Radius.xlarge, padding: Spacing.three + 2, gap: Spacing.three },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three - 2 },
  thumb: { width: 52, height: 52, borderRadius: Radius.medium },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  productText: { flex: 1, gap: 2 },
  productName: { fontSize: 16, lineHeight: 21, fontWeight: '700' },
  productMeta: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  verdictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
    padding: Spacing.three - 2,
    borderRadius: Radius.large,
  },
  verdictLabel: { fontSize: 19, lineHeight: 24, fontWeight: '800' },
  figures: { flexDirection: 'row', gap: Spacing.four },
  figure: { gap: 1 },
  figureLabel: { fontSize: 10, lineHeight: 13, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  figureValue: { fontSize: 21, lineHeight: 26, fontWeight: '800' },
  figureNote: { fontSize: 11, lineHeight: 15, fontWeight: '600' },
  reasons: { gap: Spacing.two },
  reasonsTitle: { fontSize: 10, lineHeight: 13, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  reason: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  reasonText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  missCard: { alignItems: 'center' },
  missTitle: { fontSize: 17, lineHeight: 22, fontWeight: '800', textAlign: 'center' },
  missBody: { fontSize: 13, lineHeight: 19, fontWeight: '600', textAlign: 'center' },
  centred: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, padding: Spacing.four },
  permissionTitle: { fontSize: 19, lineHeight: 24, fontWeight: '800' },
  permissionBody: { fontSize: 14, lineHeight: 20, fontWeight: '600', textAlign: 'center', maxWidth: 320 },
  primaryButton: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three - 2, borderRadius: Radius.medium },
  primaryLabel: { fontSize: 15, lineHeight: 20, fontWeight: '800' },
  pressed: { opacity: 0.7 },
  disclaimer: { fontSize: 11, lineHeight: 16, fontWeight: '600', textAlign: 'center' },
});
