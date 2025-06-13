"""Rebuild face_identity without global UNIQUE(face_id)"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'REPLACE_WITH_THIS_REV'
down_revision = 'PUT_YOUR_PREVIOUS_REVISION_HERE'
branch_labels = None
depends_on = None

def upgrade():
    # 1) create a temp table without the old UNIQUE(face_id)
    op.execute("""
        CREATE TABLE face_identity_tmp (
            id         INTEGER PRIMARY KEY,
            face_id    VARCHAR(120),
            name       VARCHAR(80),
            face_image BLOB,
            user_id    INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    """)

    # 2) copy all data across
    op.execute("""
        INSERT INTO face_identity_tmp (id, face_id, name, face_image, user_id)
        SELECT id, face_id, name, face_image, user_id FROM face_identity;
    """)

    # 3) drop the old table and rename
    op.drop_table('face_identity')
    op.execute("ALTER TABLE face_identity_tmp RENAME TO face_identity;")

    # 4) add only the composite UNIQUE you want
    op.create_unique_constraint(
        'uix_user_face',
        'face_identity',
        ['user_id', 'face_id']
    )

def downgrade():
    # reverse: drop the composite, rebuild with the old single-UNIQUE
    op.drop_constraint('uix_user_face', 'face_identity', type_='unique')

    op.execute("""
        CREATE TABLE face_identity_old (
            id         INTEGER PRIMARY KEY,
            face_id    VARCHAR(120) UNIQUE,
            name       VARCHAR(80),
            face_image BLOB,
            user_id    INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    """)
    op.execute("""
        INSERT INTO face_identity_old (id, face_id, name, face_image, user_id)
        SELECT id, face_id, name, face_image, user_id FROM face_identity;
    """)
    op.drop_table('face_identity')
    op.execute("ALTER TABLE face_identity_old RENAME TO face_identity;")