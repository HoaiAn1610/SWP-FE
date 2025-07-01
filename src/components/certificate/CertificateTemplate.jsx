import React from 'react';
import styles from './CertificateTemplate.module.css';
// Nếu dùng import ảnh nền:
import bgImage from '@/assets/Certificate.png'; // nếu dùng import

export default function CertificateTemplate({
  userName,
  courseTitle,
  date,
  certNo
}) {
  return (
    <div
      className={styles.certificateRoot}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={styles.overlay} />

      <div className={styles.content}>
       
        <h2 className={styles.recipientName}>{userName}</h2>
        <h3 className={styles.courseTitle}>{courseTitle}</h3>

        {/* Nếu muốn hiển thị số & ngày */}
        <div className={styles.footerInfo}>
          <p>Certificate No: {certNo}</p>
          <p>Date: {date}</p>
        </div>
      </div>
    </div>
  );
}
