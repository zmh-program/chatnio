DELIMITER $$

CREATE PROCEDURE Migration()
BEGIN
    DECLARE _count INT;

    SELECT COUNT(*) INTO _count
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'subscription'
      AND COLUMN_NAME = 'level';

    IF _count = 0 THEN
        ALTER TABLE subscription ADD COLUMN level INT DEFAULT 1;
        UPDATE subscription SET level = 3;
    END IF;

END $$

DELIMITER ;

CALL Migration();
