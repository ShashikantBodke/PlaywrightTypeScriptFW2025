// ============================================
// PLAYWRIGHT AUTO PIPELINE - JENKINSFILE (WINDOWS CONVERTED - DEBUGGED)
// ============================================

pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        NODE_VERSION = '20'
        CI = 'true'
        // CRITICAL: Use backslashes for Windows path separator in environment variables
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}\\.cache\\ms-playwright"
        SLACK_WEBHOOK_URL = credentials('slack-webhook-token')
        EMAIL_RECIPIENTS = 'naveenautomation20@gmail.com, submit@naveenautomationlabs.com'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        // ============================================
        // Static Code Analysis (ESLint)
        // ============================================
        stage('🔍 ESLint Analysis') {
            steps {
                echo '============================================'
                echo '📥 Installing dependencies...'
                echo '============================================'
                bat 'npm ci'

                echo '============================================'
                echo '📁 Creating ESLint report directory...'
                echo '============================================'
                // FIX: Use conditional 'if not exist' to prevent failure if directory exists (idempotent)
                bat 'if not exist eslint-report md eslint-report'

                echo '============================================'
                echo '🔍 Running ESLint...'
                echo '============================================'
                script {
                    def eslintStatus = bat(script: 'npm run lint', returnStatus: true)
                    env.ESLINT_STATUS = eslintStatus == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '📊 Generating ESLint HTML Report...'
                echo '============================================'
                bat 'npm run lint:report'
            }
            post { /* ... post steps remain the same ... */ }
        }

        // ============================================
        // DEV Environment Tests
        // ============================================
        stage('🔧 DEV Tests') {
            steps {
                echo '============================================'
                echo '🎭 Installing Playwright browsers...'
                echo '============================================'
                bat 'npx playwright install --with-deps chromium'

                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                // FIX: Ensure paths use backslashes and that the command is executed correctly
                bat 'rd /s /q allure-results playwright-report playwright-html-report test-results 2>nul'

                echo '============================================'
                echo '🧪 Running DEV tests...'
                echo '============================================'
                script {
                    env.DEV_TEST_STATUS = bat(
                        script: 'npx playwright test --grep "@login" --config=playwright.config.dev.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '🏷️ Adding Allure environment info...'
                echo '============================================'
                // FIX: Ensure quotes are not used around variables in 'echo' to prevent them being written to the file
                bat '''
                    if not exist allure-results md allure-results
                    
                    REM Use backslashes for path separators
                    echo Environment=DEV > allure-results\\environment.properties
                    echo Browser=Google Chrome >> allure-results\\environment.properties
                    echo Config=playwright.config.dev.ts >> allure-results\\environment.properties
                '''
            }
            post {
                always {
                    // FIX: Reliable copying and report generation block
                    bat '''
                        REM 1. Create directory (idempotent)
                        if not exist allure-results-dev md allure-results-dev

                        REM 2. Copy recursively (equivalent of cp -r 2>/dev/null || true)
                        REM xcopy handles recursive copy. The exit 0 at the end handles the '|| true'.
                        xcopy /E /I /Y allure-results\\* allure-results-dev\\

                        REM 3. Generate report
                        npx allure generate allure-results-dev --clean -o allure-report-dev
                        
                        REM CRITICAL: Force exit 0 to ensure the Jenkins step succeeds even if npx fails
                        exit 0
                    '''
                    // ... rest of post steps remain the same ...
                }
            }
        }

        // ============================================
        // QA, STAGE, PROD Stages
        // Apply the same `if not exist` and `rd /s /q ... 2>nul` fixes to these stages
        // ============================================
        
        stage('🔍 QA Tests') {
            steps {
                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                bat 'rd /s /q allure-results playwright-report playwright-html-report test-results 2>nul'
                
                // ... rest of steps ...
            }
            post {
                always {
                    bat '''
                        if not exist allure-results-qa md allure-results-qa
                        xcopy /E /I /Y allure-results\\* allure-results-qa\\
                        npx allure generate allure-results-qa --clean -o allure-report-qa
                        exit 0
                    '''
                    // ... rest of post steps ...
                }
            }
        }

        stage('🎯 STAGE Tests') {
            steps {
                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                bat 'rd /s /q allure-results playwright-report playwright-html-report test-results 2>nul'
                
                // ... rest of steps ...
            }
            post {
                always {
                    bat '''
                        if not exist allure-results-stage md allure-results-stage
                        xcopy /E /I /Y allure-results\\* allure-results-stage\\
                        npx allure generate allure-results-stage --clean -o allure-report-stage
                        exit 0
                    '''
                    // ... rest of post steps ...
                }
            }
        }

        stage('🚀 PROD Tests') {
            steps {
                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                bat 'rd /s /q allure-results playwright-report playwright-html-report test-results 2>nul'
                
                // ... rest of steps ...
            }
            post {
                always {
                    bat '''
                        if not exist allure-results-prod md allure-results-prod
                        xcopy /E /I /Y allure-results\\* allure-results-prod\\
                        npx allure generate allure-results-prod --clean -o allure-report-prod
                        exit 0
                    '''
                    // ... rest of post steps ...
                }
            }
        }

        // ============================================
        // Combined Allure Report
        // ============================================
        stage('📈 Combined Allure Report') {
            steps {
                echo '============================================'
                echo '📊 Generating Combined Allure Report...'
                echo '============================================'

                bat '''
                    REM Create combined results directory (idempotent)
                    if not exist allure-results-combined md allure-results-combined
                    
                    REM Copy all environment results (xcopy is used for recursive copy)
                    xcopy /E /I /Y allure-results-dev\\* allure-results-combined\\
                    xcopy /E /I /Y allure-results-qa\\* allure-results-combined\\
                    xcopy /E /I /Y allure-results-stage\\* allure-results-combined\\
                    xcopy /E /I /Y allure-results-prod\\* allure-results-combined\\

                    REM Create combined environment.properties
                    echo Environment=ALL (DEV, QA, STAGE, PROD) > allure-results-combined\\environment.properties
                    echo Browser=Google Chrome >> allure-results-combined\\environment.properties
                    echo Pipeline=%JOB_NAME% >> allure-results-combined\\environment.properties
                    echo Build=%BUILD_NUMBER% >> allure-results-combined\\environment.properties
                    
                    REM The xcopy commands may fail if the source directory is empty, which is acceptable.
                    exit 0
                '''
            }
            post { /* ... post steps remain the same ... */ }
        }
    }

    // ... post-build actions remain the same ...
}
