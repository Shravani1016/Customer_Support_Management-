from app.models.models import AuditLog


def create_audit_log(
    db,
    action,
    target_type,
    target_id=None,
    performed_by=None,
    description=None,
):
    log = AuditLog(
        action=action,
        target_type=target_type,
        target_id=target_id,
        performed_by=performed_by,
        description=description,
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log