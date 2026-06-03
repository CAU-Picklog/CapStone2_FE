/**
 * src/features/saved/screens/SavedListScreen.tsx
 * 저장한 공간 목록 — Storage(보관함) API 연동
 *
 * 폴더 칩: 전체 / 실제 Storage 목록 (API)
 * "+" 버튼으로 새 보관함 생성
 * 칩 롱프레스 → 삭제
 */

import React, { useState, useMemo, useEffect, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useStorageStore } from '../../../store/useStorageStore';
import { useSwipeTabNavigation } from '../../../hooks/useSwipeTabNavigation';
import { RootStackParamList } from '../../../navigation/types';
import { COLORS, FONTS, SPACING, THEME } from '../../../constants';
import { ApiSpot } from '../../../types/spot';
import spotService from '../../../services/spotService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ─── SpotCard 컴포넌트 ───────────────────────────────────

interface SpotCardProps {
  spot: ApiSpot;
  onPress: () => void;
  onDelete?: () => void;
}

const SpotCard = memo(function SpotCard({ spot, onPress, onDelete }: SpotCardProps) {
  const place = spot.place;
  return (
    <TouchableOpacity style={spotCardStyles.card} onPress={onPress} activeOpacity={0.75}>
      {spot.thumbnail_url ? (
        <Image source={{ uri: spot.thumbnail_url }} style={spotCardStyles.thumbnail} resizeMode="cover" />
      ) : (
        <View style={spotCardStyles.iconWrap}>
          <Ionicons name="location" size={20} color={COLORS.primary} />
        </View>
      )}
      <View style={spotCardStyles.info}>
        <Text style={spotCardStyles.name} numberOfLines={1}>
          {place?.name ?? '이름 없는 장소'}
        </Text>
        {place?.address ? (
          <Text style={spotCardStyles.address} numberOfLines={1}>{place.address}</Text>
        ) : null}
        {place?.category_group ? (
          <Text style={spotCardStyles.category}>{place.category_group}</Text>
        ) : null}
        {spot.user_memo ? (
          <Text style={spotCardStyles.memo} numberOfLines={1}>💬 {spot.user_memo}</Text>
        ) : null}
        {spot.thumbnail_url && (
          <Text style={spotCardStyles.igTag}>📷 인스타그램{(spot.image_urls?.length ?? 0) > 1 ? ` +${spot.image_urls!.length - 1}장` : ''}</Text>
        )}
      </View>
      {onDelete ? (
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={16} color={COLORS.gray[400]} />
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
      )}
    </TouchableOpacity>
  );
});

const spotCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    gap: SPACING.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 10,
    flexShrink: 0,
    backgroundColor: COLORS.gray[100],
  },
  info: { flex: 1 },
  name: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.black,
    marginBottom: 2,
  },
  address: {
    fontSize: FONTS.size.sm,
    color: COLORS.gray[500],
    marginBottom: 2,
  },
  category: {
    fontSize: FONTS.size.xs,
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
  },
  memo: {
    fontSize: FONTS.size.xs,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  igTag: {
    fontSize: FONTS.size.xs,
    color: '#C13584',
    marginTop: 2,
  },
});

// ─── 폴더 정의 ───────────────────────────────────────────

interface Folder {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  storageId?: number; // 실제 Storage ID (undefined = 전체)
}

const ALL_FOLDER: Folder = {
  id: 'all',
  label: '전체',
  icon: 'bookmark-outline',
};

// ─── 폴더 칩 컴포넌트 ────────────────────────────────────

interface FolderChipProps {
  folder: Folder;
  selected: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

const FolderChip = memo(function FolderChip({ folder, selected, onPress, onLongPress }: FolderChipProps) {
  return (
    <TouchableOpacity
      style={[chipStyles.chip, selected && chipStyles.chipSelected]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      <Ionicons
        name={folder.icon}
        size={13}
        color={selected ? COLORS.white : COLORS.gray[500]}
      />
      <Text style={[chipStyles.label, selected && chipStyles.labelSelected]}>
        {folder.label}
      </Text>
    </TouchableOpacity>
  );
});

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.radius.pill,
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.gray[600],
  },
  labelSelected: {
    color: COLORS.white,
    fontWeight: FONTS.weight.semibold,
  },
});

// ─── 메인 화면 ───────────────────────────────────────────

export default function SavedListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { storages, isLoading, fetchStorages, createStorage, deleteStorage } = useStorageStore();
  const { panHandlers, animatedStyle } = useSwipeTabNavigation();

  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');

  // 전체 탭용 — 모든 보관함 spot 합산
  const [allSpots, setAllSpots] = useState<ApiSpot[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  // Spot 목록 (보관함 개별 선택 시 로드)
  const [spots, setSpots] = useState<ApiSpot[]>([]);
  const [isLoadingSpots, setIsLoadingSpots] = useState(false);
  const loadingForRef = useRef<string | null>(null);
  // storages를 ref로 유지 → loadAllSpots를 안정적인 참조로 만들기 위함
  const storagesRef = useRef(storages);
  // 이전에 로드한 storages ID 목록 → 동일하면 silent 갱신
  const prevStorageIdsRef = useRef<string>('');

  // 보관함 생성 모달
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchStorages();
  }, []);

  // storagesRef를 항상 최신 값으로 동기화
  useEffect(() => {
    storagesRef.current = storages;
  }, [storages]);

  // Storage → Folder 변환
  const folders: Folder[] = useMemo(() => [
    ALL_FOLDER,
    ...storages.map((s): Folder => ({
      id: String(s.id),
      label: s.title,
      icon: (s.is_public ? 'people-outline' : 'lock-closed-outline') as Folder['icon'],
      storageId: s.id,
    })),
  ], [storages]);

  // 보관함 폴더 선택 시 Spot 목록 로드
  const loadSpots = useCallback((folderId: string) => {
    if (folderId === 'all') {
      setSpots([]);
      return;
    }
    const storageId = Number(folderId);
    if (isNaN(storageId)) return;
    if (loadingForRef.current === folderId) return;
    loadingForRef.current = folderId;
    setIsLoadingSpots(true);
    spotService
      .getSpots(storageId)
      .then((data) => {
        console.log(`[SavedList] storage=${storageId} spots=${data.length}`,
          data.map(s => `${s.id}→"${s.place?.name ?? 'MISSING'}"`).join(', '));
        setSpots(data);
      })
      .catch(() => {
        Alert.alert('오류', '보관함 내용을 불러오지 못했습니다.');
        setSpots([]);
      })
      .finally(() => {
        setIsLoadingSpots(false);
        loadingForRef.current = null;
      });
  }, []);

  // storages는 ref로 접근 → useCallback deps에서 제거 → 참조 안정
  // silent=true 이면 이미 데이터가 있을 때 스피너 없이 백그라운드 갱신
  const loadAllSpots = useCallback(async (silent = false) => {
    if (storagesRef.current.length === 0) return;
    if (!silent) setIsLoadingAll(true);
    try {
      const results = await Promise.all(
        storagesRef.current.map((s) => spotService.getSpots(s.id)),
      );
      const combined = results.flat();
      const seen = new Set<number>();
      setAllSpots(combined.filter((s) => {
        if (seen.has(s.place_id)) return false;
        seen.add(s.place_id);
        return true;
      }));
    } catch {
      Alert.alert('오류', '전체 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoadingAll(false);
    }
  }, []); // storagesRef.current로 접근하므로 deps 없음 → 안정적인 참조

  // 탭 변경 시 spot 로드
  useEffect(() => {
    if (selectedFolderId === 'all') loadAllSpots();
    else loadSpots(selectedFolderId);
  }, [selectedFolderId, loadSpots, loadAllSpots]);

  // storages 업데이트 시 전체 탭이면 재로드
  // ID 목록이 바뀌었을 때만 full 로드, 동일하면 silent 갱신 (스피너 없음)
  useEffect(() => {
    if (selectedFolderId !== 'all' || storages.length === 0) return;
    const newIds = storages.map((s) => s.id).sort().join(',');
    const idsChanged = newIds !== prevStorageIdsRef.current;
    prevStorageIdsRef.current = newIds;
    loadAllSpots(!idsChanged); // IDs 변경 시 full 로드, 동일하면 silent
  }, [storages]); // eslint-disable-line react-hooks/exhaustive-deps

  // 화면 포커스 시 보관함 목록 갱신 (loadAllSpots는 storages useEffect가 처리)
  useFocusEffect(
    useCallback(() => {
      fetchStorages();
      if (selectedFolderId !== 'all') {
        loadingForRef.current = null;
        loadSpots(selectedFolderId);
      }
      // 'all' 탭: fetchStorages → storages 변경 → 위 useEffect → loadAllSpots
    }, [selectedFolderId, loadSpots, fetchStorages]), // loadAllSpots 제거 → 루프 차단
  );

  const selectedFolder = folders.find((f) => f.id === selectedFolderId) ?? ALL_FOLDER;
  const isStorageFolder = selectedFolderId !== 'all';

  const renderStorageSpotItem = useCallback(({ item }: { item: ApiSpot }) => (
    <SpotCard
      spot={item}
      onPress={() => {
        if (item.place) {
          const spotImages = item.image_urls && item.image_urls.length > 0
            ? item.image_urls
            : item.thumbnail_url ? [item.thumbnail_url] : [];
          navigation.navigate('PlaceDetail', {
            placeId: `api-${item.place_id}`,
            apiPlace: item.place,
            spotImages,
          });
        }
      }}
      onDelete={() => {
        const storageId = item.storage_id;
        Alert.alert(
          '장소 삭제',
          `"${item.place?.name ?? `장소 #${item.place_id}`}"을(를)\n보관함에서 제거할까요?`,
          [
            { text: '취소', style: 'cancel' },
            {
              text: '삭제',
              style: 'destructive',
              onPress: async () => {
                try {
                  await spotService.deleteSpot(storageId, item.id);
                  setSpots((prev) => prev.filter((s) => s.id !== item.id));
                } catch {
                  Alert.alert('오류', '삭제에 실패했습니다.');
                }
              },
            },
          ]
        );
      }}
    />
  ), [navigation]);

  const renderAllSpotItem = useCallback(({ item }: { item: ApiSpot }) => (
    <SpotCard
      spot={item}
      onPress={() => {
        if (item.place) {
          const spotImages = item.image_urls && item.image_urls.length > 0
            ? item.image_urls
            : item.thumbnail_url ? [item.thumbnail_url] : [];
          navigation.navigate('PlaceDetail', {
            placeId: `api-${item.place_id}`,
            apiPlace: item.place,
            spotImages,
          });
        }
      }}
    />
  ), [navigation]);

  const handleCreateStorage = useCallback(async () => {
    if (!newTitle.trim()) {
      Alert.alert('입력 오류', '보관함 이름을 입력해주세요.');
      return;
    }
    setIsCreating(true);
    try {
      await createStorage(newTitle.trim());
      setNewTitle('');
      setShowCreateModal(false);
    } catch {
      Alert.alert('오류', '보관함 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  }, [newTitle, createStorage]);

  const handleDeleteStorage = useCallback((folder: Folder) => {
    if (!folder.storageId) return;
    Alert.alert(
      '보관함 삭제',
      `"${folder.label}" 보관함을 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStorage(folder.storageId!);
              if (selectedFolderId === folder.id) setSelectedFolderId('all');
            } catch {
              Alert.alert('오류', '보관함 삭제에 실패했습니다.');
            }
          },
        },
      ],
    );
  }, [deleteStorage, selectedFolderId]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Animated.View style={[styles.flex, animatedStyle]} {...panHandlers}>

        {/* ── 헤더 ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>저장한 공간</Text>
          <View style={styles.headerRight}>
            {(isLoading || isLoadingSpots || isLoadingAll) && (
              <ActivityIndicator size="small" color={COLORS.gray[400]} style={{ marginRight: 8 }} />
            )}
            <Text style={styles.countText}>
              {selectedFolderId === 'all' ? allSpots.length : spots.length}개
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 폴더 칩 스크롤 ── */}
        <View style={styles.folderBarWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.folderBar}
          >
            {folders.map((folder) => (
              <FolderChip
                key={folder.id}
                folder={folder}
                selected={selectedFolderId === folder.id}
                onPress={() => setSelectedFolderId(folder.id)}
                onLongPress={folder.storageId ? () => handleDeleteStorage(folder) : undefined}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Storage 정보 배너 ── */}
        {isStorageFolder && (
          <View style={styles.storageBanner}>
            <Ionicons
              name={selectedFolder.icon}
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.storageBannerText}>
              {selectedFolder.label}
              {storages.find((s) => String(s.id) === selectedFolderId)?.is_public
                ? ' · 공개 보관함'
                : ' · 비공개 보관함'}
            </Text>
          </View>
        )}

        {/* ── 장소 목록 ── */}
        {isStorageFolder ? (
          /* 보관함 선택 → Spot 목록 표시 */
          isLoadingSpots ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.emptySubtitle}>불러오는 중...</Text>
            </View>
          ) : (
            <FlatList
              data={spots}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContent}
              renderItem={renderStorageSpotItem}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="bookmark-outline" size={56} color={COLORS.gray[300]} />
                  <Text style={styles.emptyTitle}>보관함이 비어있어요</Text>
                  <Text style={styles.emptySubtitle}>
                    {`${selectedFolder.label}에\n장소를 추가해보세요`}
                  </Text>
                </View>
              }
            />
          )
        ) : (
          /* 전체 탭 → 모든 보관함 Spot 합산 */
          isLoadingAll ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.emptySubtitle}>불러오는 중...</Text>
            </View>
          ) : (
            <FlatList
              data={allSpots}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContent}
              renderItem={renderAllSpotItem}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="bookmark-outline" size={56} color={COLORS.gray[300]} />
                  <Text style={styles.emptyTitle}>저장한 공간이 없어요</Text>
                  <Text style={styles.emptySubtitle}>
                    지도에서 장소를 검색해{'\n'}보관함에 저장해보세요
                  </Text>
                </View>
              }
            />
          )
        )}
      </Animated.View>

      {/* ── 보관함 생성 모달 ── */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <KeyboardAvoidingView
          style={modalStyles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={modalStyles.backdrop}
            activeOpacity={1}
            onPress={() => setShowCreateModal(false)}
          />
          <View style={modalStyles.container}>
            <Text style={modalStyles.title}>새 보관함 만들기</Text>
            <TextInput
              style={modalStyles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="보관함 이름을 입력해주세요"
              placeholderTextColor={COLORS.gray[400]}
              autoFocus
              maxLength={30}
            />
            <View style={modalStyles.buttons}>
              <TouchableOpacity
                style={modalStyles.cancelBtn}
                onPress={() => { setShowCreateModal(false); setNewTitle(''); }}
              >
                <Text style={modalStyles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.createBtn, isCreating && { opacity: 0.6 }]}
                onPress={handleCreateStorage}
                disabled={isCreating}
              >
                {isCreating
                  ? <ActivityIndicator size="small" color={COLORS.white} />
                  : <Text style={modalStyles.createText}>만들기</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  countText: {
    fontSize: FONTS.size.md,
    color: COLORS.gray[500],
    fontWeight: FONTS.weight.medium,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  folderBarWrap: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  folderBar: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    flexDirection: 'row',
  },

  storageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    backgroundColor: THEME.colors.accentSoft,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  storageBannerText: {
    flex: 1,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.primary,
  },

  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.gray[700],
  },
  emptySubtitle: {
    fontSize: FONTS.size.md,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    width: '80%',
    backgroundColor: COLORS.white,
    borderRadius: THEME.radius.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    zIndex: 1,
  },
  title: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: THEME.radius.sm,
    padding: SPACING.md,
    fontSize: FONTS.size.md,
    color: COLORS.black,
    backgroundColor: COLORS.gray[100],
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
  },
  cancelText: {
    fontSize: FONTS.size.md,
    color: COLORS.gray[600],
    fontWeight: FONTS.weight.medium,
  },
  createBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: THEME.radius.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  createText: {
    fontSize: FONTS.size.md,
    color: COLORS.white,
    fontWeight: FONTS.weight.semibold,
  },
});
