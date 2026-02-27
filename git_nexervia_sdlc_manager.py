import subprocess
import sys
from datetime import datetime

PROTECTED_BRANCHES = ["main", "testing"]

# ===============================
# Utility
# ===============================

def run(cmd, capture=False):
    try:
        if capture:
            return subprocess.check_output(cmd, shell=True).decode().strip()
        else:
            subprocess.run(cmd, shell=True, check=True)
    except subprocess.CalledProcessError:
        print(f"❌ Command failed: {cmd}")

def confirm(msg):
    return input(f"{msg} (yes/no): ").lower() == "yes"

def get_current_branch():
    return run("git branch --show-current", capture=True)

def working_directory_clean():
    status = run("git status --porcelain", capture=True)
    return status == ""

def branch_ahead_behind(branch):
    run("git fetch")
    result = run(f"git status -sb", capture=True)
    return result

def fetch_tags():
    run("git fetch --tags")

def get_tags():
    fetch_tags()
    raw = run("git tag", capture=True)
    return sorted(raw.split("\n")) if raw else []

def suggest_next_patch(tags):
    if not tags:
        return "v1.0.0"
    latest = tags[-1]
    try:
        v = latest.lstrip("v")
        major, minor, patch = map(int, v.split("."))
        patch += 1
        return f"v{major}.{minor}.{patch}"
    except:
        return "v1.0.0"

def get_local_branches():
    raw = run("git branch", capture=True).split("\n")
    return [b.replace("*", "").strip() for b in raw]

def get_remote_branches():
    run("git fetch")
    raw = run("git branch -r", capture=True)

    branches = []
    for line in raw.split("\n"):
        line = line.strip()
        if line.startswith("origin/") and "HEAD" not in line:
            branches.append(line.replace("origin/", ""))

    return sorted(branches)

def select(items, title, allow_back=True):
    if not items:
        print("❌ Nothing available.")
        return None

    print(f"\n--- {title} ---")
    for i, item in enumerate(items, 1):
        print(f"{i}. {item}")

    if allow_back:
        print("0. Back")

    while True:
        try:
            choice = int(input("Select number: "))

            if allow_back and choice == 0:
                return "BACK"

            if 1 <= choice <= len(items):
                return items[choice - 1]
        except:
            pass

        print("❌ Invalid selection.")

def reset_from_remote_branch():
    current = get_current_branch()

    print(f"\n⚠ Current Branch: {current}")
    print("This will HARD RESET your current branch to selected remote branch.")
    print("All local commits and changes will be LOST.\n")

    remote_branches = get_remote_branches()

    selected = select(remote_branches, "Select Remote Branch to Reset From")

    if selected == "BACK":
        return

    if not selected:
        return

    print(f"\nYou are about to reset '{current}' to 'origin/{selected}'")

    confirm_text = input("Type YES to confirm destructive reset: ")

    if confirm_text != "YES":
        print("❌ Reset cancelled.")
        return

    run(f"git fetch origin {selected}")
    run(f"git reset --hard origin/{selected}")

    print(f"✅ Branch '{current}' now matches origin/{selected}")

def stash_changes():
    if working_directory_clean():
        print("✅ Working directory clean. Nothing to stash.")
        return

    message = input("Stash message (optional): ")
    if message:
        run(f'git stash push -m "{message}"')
    else:
        run("git stash")

    print("✅ Changes stashed.")


def list_stashes():
    stashes = run("git stash list", capture=True)
    if not stashes:
        print("No stashes found.")
        return []
    print("\nAvailable Stashes:")
    lines = stashes.split("\n")
    for i, s in enumerate(lines, 1):
        print(f"{i}. {s}")
    return lines

def apply_stash():
    stashes = list_stashes()
    if not stashes:
        return

    print("0. Back")
    choice = input("Select stash number to apply: ")

    if choice == "0":
        return

    index = int(choice) - 1
    run(f"git stash apply stash@{{{index}}}")
    print("✅ Stash applied.")

def drop_stash():
    stashes = list_stashes()
    if not stashes:
        return

    print("0. Back")
    choice = input("Select stash number to drop: ")

    if choice == "0":
        return

    index = int(choice) - 1
    run(f"git stash drop stash@{{{index}}}")
    print("🗑 Stash dropped.")

def revert_last_merge():
    branch = get_current_branch()

    if branch not in ["development", "testing"]:
        print("❌ Revert allowed only on development or testing.")
        return

    log = run("git log --merges -n 1 --pretty=format:%H", capture=True)

    if not log:
        print("❌ No merge commit found.")
        return

    print(f"Last merge commit: {log}")

    if confirm("Revert this merge commit?"):
        run(f"git revert -m 1 {log}")
        run(f"git push origin {branch}")
        print("✅ Last merge reverted safely.")

def undo_last_promotion():
    branch = get_current_branch()

    if branch not in ["testing", "main"]:
        print("❌ Undo promotion only allowed on testing or main.")
        return

    log = run("git log --merges -n 1 --pretty=format:%H", capture=True)

    if not log:
        print("❌ No promotion merge found.")
        return

    print(f"Last promotion merge commit: {log}")

    if confirm("Undo this promotion?"):
        run(f"git revert -m 1 {log}")
        run(f"git push origin {branch}")
        print("✅ Promotion safely undone.")
        
def show_uncommitted_changes():
    status = run("git status --short", capture=True)

    if not status:
        print("✅ Working directory clean.")
        return

    print("\n🔍 Uncommitted Changes:")
    print("----------------------------------")
    print(status)
    print("----------------------------------")

    if confirm("Show full diff?"):
        diff = run("git diff", capture=True)
        print("\n📝 Full Diff:")
        print("----------------------------------")
        print(diff)
        print("----------------------------------")


def show_lifecycle_notes():
    print("""
================ NEXERVIA SDLC GOVERNANCE ================

ENVIRONMENTS:
-----------------------------------------------------------
main      → Production (STRICTLY PROTECTED)
testing   → UAT / Pre-Prod
develop   → Integration Branch

WORK BRANCHES:
-----------------------------------------------------------
feature/* → New functionality
bugfix/*  → Minor non-prod fixes
hotfix/*  → Production emergency fixes

-----------------------------------------------------------
PROMOTION FLOW
-----------------------------------------------------------
feature/bugfix → develop
develop        → testing
testing        → main (tag required)

hotfix         → main → testing → develop

-----------------------------------------------------------
IMPORTANT RULES
-----------------------------------------------------------
1. Never commit directly on main or testing.
2. Never force-push shared branches.
3. Only tag from main.
4. Rollback only allowed on main.
5. Revert promotion instead of force reset.
6. Stash before switching branches if uncommitted work.
7. Promotion allowed only from correct source branch.
8. Hotfix must be propagated to all branches.

-----------------------------------------------------------
ROLLBACK STRATEGY
-----------------------------------------------------------
Feature mistake:
→ Revert merge on develop

Testing promotion mistake:
→ Revert merge on testing

Production issue:
→ Rollback to tagged version

-----------------------------------------------------------
ARCHITECT PRINCIPLE
-----------------------------------------------------------
Branches represent environments.
Merges represent promotions.
Tags represent releases.
Reverts represent controlled rollback.

============================================================
""")
    

def today():
    return datetime.now().strftime("%Y-%m-%d")

# ===============================
# Startup Intelligence
# ===============================

def startup_flow():
    print("\n====== Nexervia SDLC Manager ======")

    try:
        print(f"Repo: {run('git remote get-url origin', capture=True)}")
    except:
        print("❌ Not a Git repository.")
        sys.exit()

    branch = get_current_branch()
    print(f"Current Branch: {branch}")
    print(f"Working Directory Clean: {working_directory_clean()}")

    while True:
        print("""
Startup Options:
1. Continue on current branch
2. Pull latest for current branch
3. Switch to development
4. Change branch
5. View SDLC Lifecycle Notes
6. Exit
""")
        choice = input("Select option: ")

        # 1️⃣ Continue
        if choice == "1":
            break

        # 2️⃣ Pull current branch
        elif choice == "2":
            if confirm(f"Pull latest from {branch}?"):
                run(f"git pull origin {branch}")
            break

        # 3️⃣ Switch to development
        elif choice == "3":
            if not working_directory_clean():
                print("❌ Uncommitted changes detected. Commit or stash first.")
                continue

            if confirm("Switch to development?"):
                run("git checkout development")
                run("git pull origin development")
            break

        # 4️⃣ Change branch (NEW OPTION)
        elif choice == "4":
            if not working_directory_clean():
                print("❌ Uncommitted changes detected.")
                show_uncommitted_changes()
                continue

            branches = get_local_branches()
            selected = select(branches, "Select Branch to Switch")

            if selected:
                run(f"git checkout {selected}")

                if confirm("Pull latest for this branch?"):
                    run(f"git pull origin {selected}")

                print(f"✅ Switched to {selected}")
                break

        # 5️⃣ Exit

        elif choice == "5": show_lifecycle_notes()
            

        # 5️⃣ Exit
        elif choice == "6":
            sys.exit()

        else:
            print("Invalid option.")


# ===============================
# Branch Creation
# ===============================

def start_feature():
    if not confirm("Create feature from development?"):
        return
    name = input("Feature name: ")
    branch = f"feature/{name}-{today()}"
    run("git checkout development")
    run("git pull origin development")
    run(f"git checkout -b {branch}")
    print(f"Working on {branch}")

def start_bugfix():
    if not confirm("Create bugfix from development?"):
        return
    name = input("Bugfix name: ")
    branch = f"bugfix/{name}-{today()}"
    run("git checkout development")
    run("git pull origin development")
    run(f"git checkout -b {branch}")
    print(f"Working on {branch}")

def start_hotfix():
    if not confirm("Production issue confirmed?"):
        return
    name = input("Hotfix name: ")
    branch = f"hotfix/{name}-{today()}"
    run("git checkout main")
    run("git pull origin main")
    run(f"git checkout -b {branch}")
    print(f"Working on {branch}")



# ===============================
# Commit & Push
# ===============================

def commit_push():
    branch = get_current_branch()

    print(f"\nCurrent Branch: {branch}")

    if branch in PROTECTED_BRANCHES:
        print("❌ Direct commits not allowed on protected branches.")
        return

    staged = run("git diff --cached --name-status", capture=True)

    if not staged:
        print("\n❌ No staged changes found.")

        print("""
Options:
1. Stage all changes (git add .)
2. Show uncommitted changes
0. Back
""")

        choice = input("Select option: ")

        if choice == "1":
            run("git add .")
            print("✅ All changes staged.")
        elif choice == "2":
            show_uncommitted_changes()
        return

    print("\n📦 Staged Changes:")
    print("----------------------------------")
    print(staged)
    print("----------------------------------")

    print("\n0. Back")
    confirm_input = input("Proceed with commit? (yes/no/0): ")

    if confirm_input == "0":
        return

    if confirm_input.lower() != "yes":
        print("❌ Commit cancelled.")
        return

    if branch == "development":
        print("\n⚠ You are committing directly to 'development'.")
        dev_confirm = input("Type DEV to confirm: ")
        if dev_confirm != "DEV":
            print("❌ Development commit aborted.")
            return

    message = input("Commit message: ")

    if not message.strip():
        print("❌ Commit message cannot be empty.")
        return

    run(f'git commit -m "{message}"')

    if confirm("Push to remote?"):
        run(f"git push origin {branch}")
        print("✅ Commit pushed successfully.")
    else:
        print("✅ Commit created locally.")

# ===============================
# Promotion
# ===============================

def merge_to_development():
    branches = [b for b in get_local_branches()
                if b.startswith("feature/") or b.startswith("bugfix/")]
    source = select(branches, "Select branch to merge into development")

    if source and confirm(f"Merge {source} into development?"):
        run("git checkout development")
        run("git pull origin development")
        run(f"git merge {source}")
        run("git push origin development")

def promote_development_to_testing():
    current = get_current_branch()

    if current != "development":
        print("❌ Promotion allowed only from 'development' branch.")
        print(f"👉 You are currently on '{current}'")
        return

    if not confirm("Promote development → testing?"):
        return

    if not working_directory_clean():
        print("❌ Uncommitted changes detected. Commit or stash first.")
        return

    run("git checkout testing")
    run("git pull origin testing")
    run("git merge development")
    run("git push origin testing")

    print("✅ development successfully promoted to testing")


def promote_testing_to_main():
    current = get_current_branch()

    if current != "testing":
        print("❌ Promotion allowed only from 'testing' branch.")
        print(f"👉 You are currently on '{current}'")
        return

    if not confirm("Promote testing → main (Production)?"):
        return

    if not working_directory_clean():
        print("❌ Uncommitted changes detected.")
        show_uncommitted_changes()
        return

    run("git checkout main")
    run("git pull origin main")
    run("git merge testing")
    run("git push origin main")

    print("✅ testing successfully promoted to main")

    if confirm("Create release tag now?"):
        create_tag()

def create_tag():
    tags = get_tags()
    print("\nExisting Tags:")
    for i, t in enumerate(tags, 1):
        print(f"{i}. {t}")

    suggested = suggest_next_patch(tags)
    print(f"Suggested next version: {suggested}")

    if confirm(f"Use {suggested}?"):
        version = suggested
    else:
        version = input("Enter version manually: ")

    run(f'git tag -a {version} -m "Release {version}"')
    run(f"git push origin {version}")

def finalize_hotfix():
    branches = [b for b in get_local_branches()
                if b.startswith("hotfix/")]

    if not branches:
        print("❌ No hotfix branches found.")
        return

    source = select(branches, "Select hotfix to finalize")

    if not source:
        return

    # 1️⃣ Merge into main
    if confirm(f"Merge {source} into main (Production)?"):
        run("git checkout main")
        run("git pull origin main")
        run(f"git merge {source}")
        run("git push origin main")

        # 2️⃣ Create hotfix tag
        if confirm("Create hotfix release tag?"):
            create_tag()

    # 3️⃣ Merge into testing
    if confirm("Merge hotfix into testing?"):
        run("git checkout testing")
        run("git pull origin testing")
        run(f"git merge {source}")
        run("git push origin testing")

    # 4️⃣ Merge into development
    if confirm("Merge hotfix into development?"):
        run("git checkout development")
        run("git pull origin development")
        run(f"git merge {source}")
        run("git push origin development")

    print("✅ Hotfix fully propagated across environments.")

# ===============================
# Rollback
# ===============================

def rollback():
    branch = get_current_branch()

    if branch != "main":
        print("❌ Rollback allowed only on main.")
        return

    tags = get_tags()
    version = select(tags, "Select tag to rollback MAIN")

    if version and confirm(f"Rollback main to {version}?"):
        run("git reset --hard " + version)
        run("git push -f origin main")
        print("✅ Production rolled back.")


# ===============================
# Menu
# ===============================

def menu():
    while True:
        print("""
========== SDLC Menu ==========
1. Start Feature
2. Start Bugfix
3. Start Hotfix
4. Commit & Push
5. Merge Feature/Bugfix → development
6. Promote development → Testing
7. Promote Testing → Main
8. Finalize Hotfix
9. Rollback Production
10. Stash Changes
11. Apply Stash
12. Drop Stash
13. Revert Last Merge (development/Testing)
14. Undo Last Promotion
15. Reset Current Branch from Remote Branch
16. View SDLC Lifecycle Notes
0. Exit
===============================
""")

        choice = input("Select option: ")

        if choice == "1": start_feature()
        elif choice == "2": start_bugfix()
        elif choice == "3": start_hotfix()
        elif choice == "4": commit_push()
        elif choice == "5": merge_to_development()
        elif choice == "6": promote_development_to_testing()
        elif choice == "7": promote_testing_to_main()
        elif choice == "8": finalize_hotfix()
        elif choice == "9": rollback()
        elif choice == "10": stash_changes()
        elif choice == "11": apply_stash()
        elif choice == "12": drop_stash()
        elif choice == "13": revert_last_merge()
        elif choice == "14": undo_last_promotion()
        elif choice == "15": reset_from_remote_branch()
        elif choice == "16": show_lifecycle_notes()
        elif choice == "0": sys.exit()


        else: print("Invalid option.")

# ===============================

if __name__ == "__main__":
    startup_flow()
    menu()
