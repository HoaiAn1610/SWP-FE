import React from 'react';
import styles from './CertificateTemplate.module.css';

export default function CertificateTemplate({
  userName,
  courseTitle,
  date,
  certNo
}) {
  return (
    <div id="certificate-root" className={styles.certificateRoot}>
      <div className={styles.triangleTopLeft} />
      <div className={styles.triangleBottomRight} />

      <div className={styles.content}>
        <h1 className={styles.title}>Certificate of Completion</h1>
        <p className={styles.subtitle}>This is to certify that</p>
        <h2 className={styles.recipientName}>{userName}</h2>

        <div className={styles.divider} />

        <p className={styles.courseDescription}>
          has successfully completed the course
        </p>
        <h3 className={styles.courseTitle}>{courseTitle}</h3>

        <div className={styles.footer}>
          <div className={styles.signatureBlock}>
            <span className={styles.signatureLine} />
            <span className={styles.signatureLabel}>Instructor Signature</span>
          </div>
          <div className={styles.seal}>SEAL</div>
        </div>

        <div className={styles.bottomInfo}>
          <span>Certificate No: {certNo}</span>
          <span>Date: {date}</span>
        </div>
      </div>
    </div>
  );
}
