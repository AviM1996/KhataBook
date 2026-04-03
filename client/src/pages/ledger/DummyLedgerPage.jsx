import React from 'react';
import { MdArrowBack, MdArrowUpward, MdArrowDownward, MdRefresh, MdLocationOn, MdEdit, MdDelete, MdNotes, MdDateRange } from 'react-icons/md';
import { LuEye } from 'react-icons/lu';
import { MoreMenu } from '../../components';
import styles from './DummyLedger.module.css';

export default function DummyLedgerPage() {
  const renderBubble = (type, amount, time, due, notes) => {
    const isRed = type === 'red';
    const Icon = isRed ? MdArrowUpward : MdArrowDownward;
    
    return (
      <div className={`${styles.bubbleWrap} ${isRed ? styles.red : styles.green}`}>
        <div className={styles.bubbleBody}>
          <div>
            <div className={styles.bContent}>
              <Icon className={isRed ? styles.redText : styles.greenText} />
              <span className={isRed ? styles.redText : styles.greenText}>
                {amount} <span className={styles.bMeta}>{time}</span>
              </span>
            </div>
            <div className={styles.bMeta} style={{ marginTop: '4px', paddingLeft: '32px' }}>
              {notes}
            </div>
          </div>
          <MoreMenu
            items={[
              { label: 'Edit', icon: <MdEdit />, onClick: () => {} },
              { label: 'Delete', icon: <MdDelete />, danger: true, onClick: () => {} }
            ]}
          />
        </div>
        <div className={styles.dueAmount}>
          Due {due}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Top Header Section */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Customers</h1>
          <p className={styles.pageSubtitle}>Manage customer accounts and payments</p>
        </div>
        <div className={styles.topActions}>
          <button className={styles.goBackBtn}>
            <MdArrowBack /> Go Back
          </button>
          <LuEye className={styles.eyeIcon} />
        </div>
      </div>

      {/* Header Card Area */}
      <div className={styles.headerCard}>
        <div className={styles.headerTop}>
          <div className={styles.profileSection}>
            <div className={styles.avatar}>A</div>
            <span className={styles.profileName}>Avishek Maity(9876543210)</span>
            <span className={styles.location}><MdLocationOn /> Kolkata</span>
          </div>
          <div className={styles.headerBadges}>
            <span className={styles.badge}>Promise break = 10</span>
            <span className={styles.badge}>Risk Score: 20/100 (High)</span>
            <span className={styles.badge}>Avg Payment days = 45</span>
          </div>
        </div>

        <div className={styles.headerBottom}>
          <div className={styles.statRow}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Net Balance</span>
              <span className={`${styles.statValue} ${styles.textBlue}`}>₹ 4000</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Credit</span>
              <span className={`${styles.statValue} ${styles.textBlue}`}>₹ 10000</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Payments</span>
              <span className={`${styles.statValue} ${styles.textBlue}`}>₹ 6000</span>
            </div>
          </div>
          <div className={styles.statRight}>
            <div>12/03/25 Customer Registration Date</div>
            <div>20000 Total Business</div>
            <div className={styles.badge} style={{ borderStyle: 'dashed', borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }}>Date Filter</div>
          </div>
        </div>
      </div>

      {/* Main Split Body */}
      <div className={styles.mainBody}>
        {/* Left Side: Timeline */}
        <div className={styles.ledgerSide}>
          <div className={styles.timeline}>
            <div className={styles.dateBreak}>02 April 2025</div>
            {renderBubble('red', '10000', '9.23 pm', '10000', 'notes')}
            {renderBubble('green', '6000', '9.23 pm', '4000', 'notes')}
            
            <div className={styles.dateBreak}>Today</div>
            {renderBubble('red', '2000', '9.23 pm', '80000', 'notes')}
            {renderBubble('green', '2000', '9.23 pm', '40000', 'notes')}
          </div>

          <div className={styles.actionFooter}>
            <button className={styles.actionBtn}>
              <MdArrowDownward className={styles.greenText} /> Payment
            </button>
            <button className={styles.actionBtn}>
              <MdRefresh className={styles.textBlue} /> Return
            </button>
            <button className={styles.actionBtn}>
              <MdArrowUpward className={styles.redText} /> Given
            </button>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className={styles.formSide}>
          <div className={styles.formTitle}>Transaction</div>
          <div className={styles.hugeAmount}>450</div>
          
          <div className={styles.fieldGroup}>
            <div className={styles.inputField}>
              <MdNotes className={styles.textBlue} style={{ fontSize: '1.2rem' }} /> Add Notes
            </div>
            <div className={styles.inputField}>
              <MdDateRange className={styles.textBlue} style={{ fontSize: '1.2rem' }} /> Bill Dates: Today
            </div>
            <div className={styles.inputField} style={{ justifyContent: 'center' }}>
              Payment Method
            </div>
          </div>

          <button className={styles.confirmBtn}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
