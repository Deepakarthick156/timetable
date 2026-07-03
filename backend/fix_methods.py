import os

directory = r'c:\Users\Deepak156\OneDrive\Desktop\TimeTable\backend\src\main\java\com\college\assistant'

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements
    new_content = content.replace('findByDepartmentIdAndYearIdAndSectionId', 'findByDepartment_IdAndYear_IdAndSection_Id')
    new_content = new_content.replace('findByStudentId', 'findByStudent_Id')
    new_content = new_content.replace('findByUserId', 'findByUser_Id')

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {filepath}')

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.java'):
            replace_in_file(os.path.join(root, file))
