import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import fileService from '../../services/fileService';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const MOCK_FILES = [
  { id: 1, name: '프로젝트 계획서.docx', fileType: 'FILE', size: 2048000, mimeType: 'application/msword', createdAt: '2024-06-15', ownerName: '김철수' },
  { id: 2, name: '예산안.xlsx', fileType: 'FILE', size: 512000, mimeType: 'application/excel', createdAt: '2024-06-14', ownerName: '이영희' },
  { id: 3, name: '디자인 리소스', fileType: 'FOLDER', size: 0, createdAt: '2024-06-10', ownerName: '박민준' },
  { id: 4, name: '발표자료.pptx', fileType: 'FILE', size: 8192000, mimeType: 'application/powerpoint', createdAt: '2024-06-08', ownerName: '정수진' },
  { id: 5, name: '회의록_06월.pdf', fileType: 'FILE', size: 256000, mimeType: 'application/pdf', createdAt: '2024-06-05', ownerName: '최동현' },
  { id: 6, name: '팀 사진', fileType: 'FOLDER', size: 0, createdAt: '2024-06-01', ownerName: '김철수' },
];

const FOLDER_TREE = [
  { id: 'my', label: '내 파일', icon: '📁' },
  { id: 'team', label: '팀 파일', icon: '👥' },
  { id: 'shared', label: '공유 파일', icon: '🔗' },
];

function getFileIcon(item) {
  if (item.fileType === 'FOLDER') return '📁';
  const mime = item.mimeType || '';
  const name = item.name || '';
  if (mime.includes('image') || /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(name)) return '🖼️';
  if (mime.includes('sheet') || /\.(xlsx|xls|csv)$/i.test(name)) return '📊';
  if (mime.includes('zip') || mime.includes('archive') || /\.(zip|tar|gz|rar)$/i.test(name)) return '📦';
  if (mime.includes('pdf') || /\.pdf$/i.test(name)) return '📕';
  if (/\.(pptx?|key)$/i.test(name)) return '📊';
  return '📄';
}

function formatSize(bytes) {
  if (!bytes) return '-';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

const styles = {
  page: { width: '100%' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  title: { fontSize: '1.4rem', fontWeight: 800, color: '#0f766e' },
  toolbar: { display: 'flex', gap: '10px' },
  uploadBtn: {
    background: '#0f766e', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '8px 18px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
  },
  folderBtn: {
    background: '#fff', color: '#475569', border: '1px solid #e2e8f0',
    borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
  },
  layout: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  sidebar: {
    width: '180px', minWidth: '180px', background: '#fff',
    borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  sidebarTitle: {
    padding: '14px 16px 10px', fontSize: '0.75rem', fontWeight: 700,
    color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px',
    borderBottom: '1px solid #f1f5f9',
  },
  folderItem: {
    padding: '10px 16px', fontSize: '0.875rem', cursor: 'pointer',
    borderLeft: '3px solid transparent', color: '#475569', fontWeight: 500,
    display: 'flex', gap: '8px', alignItems: 'center', transition: 'all 0.1s',
  },
  folderItemActive: { background: '#f0fdfa', color: '#0f766e', borderLeftColor: '#0f766e', fontWeight: 700 },
  main: { flex: 1 },
  dropZone: {
    border: '2px dashed #99f6e4', borderRadius: '12px', padding: '24px',
    background: '#f0fdfa', textAlign: 'center', marginBottom: '16px',
    color: '#0f766e', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
  },
  viewToggle: {
    display: 'flex', gap: '6px', marginBottom: '14px', justifyContent: 'flex-end',
  },
  viewBtn: {
    border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px 10px',
    fontSize: '0.82rem', cursor: 'pointer', background: '#fff', color: '#475569',
  },
  viewBtnActive: { background: '#0f766e', color: '#fff', borderColor: '#0f766e' },
  fileGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px',
  },
  fileCard: {
    background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0',
    padding: '16px 12px', textAlign: 'center', cursor: 'pointer',
    transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  fileIcon: { fontSize: '2.2rem', marginBottom: '8px' },
  fileName: {
    fontSize: '0.8rem', fontWeight: 600, color: '#334155',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    marginBottom: '4px',
  },
  fileMeta: { fontSize: '0.72rem', color: '#94a3b8' },
  table: {
    width: '100%', borderCollapse: 'collapse', background: '#fff',
    borderRadius: '12px', overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
  },
  th: {
    background: '#f8fafc', padding: '11px 16px', textAlign: 'left',
    fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 16px', fontSize: '0.875rem', color: '#334155',
    borderBottom: '1px solid #f1f5f9',
  },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' },
  input: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '9px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
    marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9',
  },
  cancelBtn: {
    background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0',
    borderRadius: '8px', padding: '9px 20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
  },
  saveBtn: {
    background: '#0f766e', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '9px 24px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
  },
};

function FilePage() {
  const { user } = useAuth();
  const [activeFolder, setActiveFolder] = useState('my');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [folderModal, setFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [hoveredFile, setHoveredFile] = useState(null);
  const fileInputRef = useRef();

  const fetchFiles = async (folder) => {
    setLoading(true);
    try {
      const result = await fileService.getList({ folder });
      const items = result?.content || result?.data || result;
      if (Array.isArray(items)) setFiles(items);
      else throw new Error();
    } catch {
      setFiles(MOCK_FILES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(activeFolder); }, [activeFolder]);

  const handleUpload = async (fileList) => {
    const arr = Array.from(fileList);
    for (const f of arr) {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('folder', activeFolder);
      try {
        const result = await fileService.upload(fd);
        const newFile = result?.data || result;
        setFiles(prev => [newFile, ...prev]);
      } catch {
        setFiles(prev => [{
          id: Date.now() + Math.random(),
          name: f.name,
          fileType: 'FILE',
          size: f.size,
          mimeType: f.type,
          createdAt: new Date().toISOString().slice(0, 10),
          ownerName: user?.name || '나',
        }, ...prev]);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) { alert('폴더명을 입력하세요.'); return; }
    try {
      const result = await fileService.createFolder({ name: folderName, parent: activeFolder });
      setFiles(prev => [result?.data || result, ...prev]);
    } catch {
      setFiles(prev => [{
        id: Date.now(), name: folderName, fileType: 'FOLDER',
        size: 0, createdAt: new Date().toISOString().slice(0, 10), ownerName: user?.name || '나',
      }, ...prev]);
    }
    setFolderName('');
    setFolderModal(false);
  };

  const handleFileClick = (item) => {
    if (item.fileType === 'FOLDER') return;
    fileService.download(item.id, item.name).catch(() => alert('다운로드 기능은 백엔드 연결 후 사용 가능합니다.'));
  };

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    if (!window.confirm(`"${item.name}"을(를) 삭제하시겠습니까?`)) return;
    try { await fileService.delete(item.id); } catch {}
    setFiles(prev => prev.filter(f => f.id !== item.id));
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>📁 파일공유</div>
        <div style={styles.toolbar}>
          <button style={styles.folderBtn} onClick={() => setFolderModal(true)}>+ 폴더 생성</button>
          <button style={styles.uploadBtn} onClick={() => fileInputRef.current?.click()}>
            ⬆ 업로드
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>
      </div>

      <div style={styles.layout}>
        {/* 폴더 트리 */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarTitle}>폴더</div>
          {FOLDER_TREE.map(f => (
            <div
              key={f.id}
              style={{
                ...styles.folderItem,
                ...(activeFolder === f.id ? styles.folderItemActive : {}),
              }}
              onClick={() => setActiveFolder(f.id)}
            >
              <span>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>

        {/* 메인 영역 */}
        <div style={styles.main}>
          {/* 드래그앤드롭 영역 */}
          <div
            style={{
              ...styles.dropZone,
              background: dragOver ? '#ccfbf1' : '#f0fdfa',
              borderColor: dragOver ? '#0f766e' : '#99f6e4',
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {dragOver ? '놓으면 업로드됩니다' : '파일을 드래그하거나 클릭해서 업로드'}
          </div>

          {/* 뷰 토글 */}
          <div style={styles.viewToggle}>
            <button
              style={{ ...styles.viewBtn, ...(viewMode === 'grid' ? styles.viewBtnActive : {}) }}
              onClick={() => setViewMode('grid')}
            >
              ⊞ 그리드
            </button>
            <button
              style={{ ...styles.viewBtn, ...(viewMode === 'list' ? styles.viewBtnActive : {}) }}
              onClick={() => setViewMode('list')}
            >
              ☰ 목록
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>로딩 중...</div>
          ) : files.length === 0 ? (
            <EmptyState icon="📁" title="파일이 없습니다" sub="파일을 업로드해보세요." />
          ) : viewMode === 'grid' ? (
            <div style={styles.fileGrid}>
              {files.map(item => (
                <div
                  key={item.id}
                  style={{
                    ...styles.fileCard,
                    boxShadow: hoveredFile === item.id ? '0 4px 16px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                    transform: hoveredFile === item.id ? 'translateY(-2px)' : 'none',
                  }}
                  onMouseEnter={() => setHoveredFile(item.id)}
                  onMouseLeave={() => setHoveredFile(null)}
                  onClick={() => handleFileClick(item)}
                  title={item.name}
                >
                  <div style={styles.fileIcon}>{getFileIcon(item)}</div>
                  <div style={styles.fileName}>{item.name}</div>
                  <div style={styles.fileMeta}>
                    {item.fileType === 'FOLDER' ? '폴더' : formatSize(item.size)}
                    <br />{item.createdAt?.slice(0, 10)}
                  </div>
                  {item.fileType === 'FILE' && (
                    <div style={{ marginTop: '8px' }}>
                      <button
                        style={{
                          fontSize: '0.72rem', color: '#dc2626', background: 'none',
                          border: 'none', cursor: 'pointer', padding: '2px 6px',
                        }}
                        onClick={(e) => handleDelete(e, item)}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: '12px' }}>
              <table style={{ ...styles.table, minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={styles.th}>이름</th>
                    <th style={styles.th}>크기</th>
                    <th style={styles.th}>수정일</th>
                    <th style={styles.th}>소유자</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(item => (
                    <tr
                      key={item.id}
                      style={{
                        cursor: 'pointer',
                        background: hoveredFile === item.id ? '#f0fdfa' : '#fff',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={() => setHoveredFile(item.id)}
                      onMouseLeave={() => setHoveredFile(null)}
                      onClick={() => handleFileClick(item)}
                    >
                      <td style={styles.td}>
                        <span style={{ marginRight: '8px' }}>{getFileIcon(item)}</span>
                        {item.name}
                      </td>
                      <td style={{ ...styles.td, color: '#64748b' }}>{formatSize(item.size)}</td>
                      <td style={{ ...styles.td, color: '#94a3b8' }}>{item.createdAt?.slice(0, 10)}</td>
                      <td style={{ ...styles.td, color: '#64748b' }}>{item.ownerName}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        {item.fileType === 'FILE' && (
                          <button
                            style={{
                              fontSize: '0.78rem', color: '#dc2626', background: 'none',
                              border: 'none', cursor: 'pointer', padding: '3px 8px',
                            }}
                            onClick={(e) => handleDelete(e, item)}
                          >
                            삭제
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 폴더 생성 모달 */}
      <Modal isOpen={folderModal} onClose={() => setFolderModal(false)} title="새 폴더 만들기" maxWidth="400px">
        <div style={styles.formGroup}>
          <label style={styles.label}>폴더 이름 *</label>
          <input
            style={styles.input}
            placeholder="폴더 이름 입력"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
            autoFocus
          />
        </div>
        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={() => setFolderModal(false)}>취소</button>
          <button style={styles.saveBtn} onClick={handleCreateFolder}>만들기</button>
        </div>
      </Modal>
    </div>
  );
}

export default FilePage;
